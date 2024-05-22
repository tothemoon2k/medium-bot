require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { autoScroll, delay, filterArticlesByClaps } = require("./helper");
const { generateAllPrompts } = require("./prompts");
const {queryImg} = require("./image");
const {postViaAPI} = require("./handleAPI");

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_KEY,
});

const login = async (page, author) => {
    await page.goto('https://medium.com');
    await page.waitForNetworkIdle();

    await page.goto("https://medium.com/m/signin");

    await delay(4000);

    const links = await page.$$eval('a', links => {
        return links.map(link => link.href) 
    })

    const facebookUrl = links.find(url => url.includes('facebook'));

    await page.goto(facebookUrl);

    await page.waitForSelector("#email", { timeout: 60000 });

    await delay(2000);

    await page.type('#email', author.email, { delay: 250 });
    await page.type('#pass', author.pass, { delay: 250 });

    await page.click('#loginbutton');
}

const grabArticles = async (browser, page) => {
    await page.waitForSelector("article a", { timeout: 60000 });
    /*

    await autoScroll(page, 7);

    let allArticles = [];

    while (allArticles.length < 20) {
        const articles = await page.$$eval('article a', anchors =>
            Array.from(new Set(
                anchors
                    .map(anchor => anchor.href)
                    .filter(href => /https:\/\/medium\.com\/(@[a-zA-Z0-9]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)(\?source=.*)?/g.test(href))
                    .filter(href => !href.includes("/tag/"))
                ))
        );

        const filteredArticles = await filterArticlesByClaps(browser, articles);
        
        allArticles = [...allArticles, ...filteredArticles];

        console.log(`Found ${allArticles.length} 1k articles so far`);

        if (allArticles.length < 20) {
            await autoScroll(page, 3);
        }
    }

    console.log(allArticles);
    return allArticles;
    */

    return(["https://medium.com/@stephenmoore/skateboarding-taught-me-everything-about-life-e04779da0bef"]);
};

const generateArticle = async (headline, articleBody, imgUrl) => {
    const prompts = generateAllPrompts(headline, articleBody, imgUrl);

    const responses = [];

    for (let prompt of prompts) {
        const requestParams = {
          model: "claude-3-sonnet-20240229",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        };
    
        try {
          const response = await anthropic.messages.create(requestParams);
          responses.push(response.content[0].text);
        } catch (error) {
          console.error(`Failed to generate message for prompt "${prompt}":`, error);
        }
    }

    return responses;
 };

const writeArticle = async (page, link, author) => {
    await page.goto(link);

    const h1 = await page.$('h1[data-testid="storyTitle"]');
    const headline = await page.evaluate(element => element.textContent, h1);

    const paragraphs = await page.$$eval('p.pw-post-body-paragraph', elements => {
        return elements.map(element => element.textContent);
    });

    const articleBody = paragraphs.join('\n');

    //const imgUrl = await queryImg(headline);

    const imgUrl = ""

    const articleDetails = await generateArticle(headline, articleBody, imgUrl);

    console.log(articleDetails[2]);

    console.log("Keywords", articleDetails[2].split(","));

    const res = await postViaAPI(author.apiDetails, articleDetails[0], articleDetails[1], articleDetails[2].split(","));

    console.log("From write article:", res);

    return(res);
}

module.exports = {login, grabArticles, writeArticle};