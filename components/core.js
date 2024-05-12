require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { autoScroll, delay, filterArticlesByClaps } = require("./helper");
const { generatePrompt } = require("./prompts");
const {queryImg} = require("./image");

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

    return allArticles;
};

const generateArticle = async (headline, articleBody) => {
    const prompt = generatePrompt(headline, articleBody);
    const requestParams = {
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    };
  
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await anthropic.messages.create(requestParams);
        return JSON.parse(response.content[0].text);
      } catch (error) {
        console.error(`Failed to generate message (Attempt #${attempt + 1}):`, error);
      }
    }
  
    console.error("Failed to generate message after two attempts.");
    return null;
 };

const writeArticle = async (page, link) => {
    await page.goto(link);

    const h1 = await page.$('h1[data-testid="storyTitle"]');
    const headline = await page.evaluate(element => element.textContent, h1);

    const paragraphs = await page.$$eval('p.pw-post-body-paragraph', elements => {
        return elements.map(element => element.textContent);
    });

    const articleBody = paragraphs.join('\n');

    await page.goto("https://medium.com/new-story");

    /*
    const imgUrl = await queryImg("About Me & My To Promote Actionable  Business Advice");
    console.log(imgUrl);
    */

    await page.waitForSelector('p[data-testid="editorParagraphText"]', { timeout: 60000 });

    const obj = await generateArticle(headline, articleBody);

    await page.waitForSelector('h3', { timeout: 60000 });
    const headlineInput = await page.$('h3');

    await headlineInput.click();
    await headlineInput.type(obj.headline, { delay: 50 });

    await page.waitForSelector('p[data-testid="editorParagraphText"]', { timeout: 60000 });
    const articleBodyInput = await page.$('p[data-testid="editorParagraphText"]');
    
    await articleBodyInput.click();
    await articleBodyInput.type(obj.articleBody); //Add delay back {delay: 70}

    return(obj);
}

const polishArticle = async (page, res) => {
    await delay(2000);

    const keywordStr = res.keywords.map(str => str.trim()).join(', ') + ',';

    const inputField = await page.$('.js-tagInput.tags-input.editable')
    await inputField.click();
    await page.type('.js-tagInput.tags-input.editable', keywordStr, {delay: 250});

    await delay(2000);
}

module.exports = {login, grabArticles, writeArticle, polishArticle };