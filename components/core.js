const Anthropic = require('@anthropic-ai/sdk');
const { autoScroll, delay } = require("./helper");
const {generatePrompt} = require("./prompts");
const FormData = require('form-data');
const axios = require("axios");

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_KEY,
});

const login = async (page, author) => {
    await page.goto('https://medium.com');
    await page.waitForNetworkIdle();

    await page.click('button.cg.ch.ci.cj.ck.cl.cm.cn.co.cp.cq.cr.cs.ct.cu.cv.cw.cx.cy.cz');

    await page.waitForNetworkIdle();

    const links = await page.$$eval('a', links => {
        return links.map(link => link.href) 
    })

    const facebookUrl = links.find(url => url.includes('facebook'));

    await page.goto(facebookUrl);

    await page.waitForNetworkIdle();

    await page.type('#email', author.email, { delay: 250 });
    await page.type('#pass', author.pass, { delay: 250 });

    const screenshotBuffer = await page.screenshot();
    
        const formData = new FormData();
        formData.append('image', screenshotBuffer, 'screenshot.png');
    
        try {
        const imgurResponse = await axios.post('https://api.imgur.com/3/image', formData, {
            headers: {
            'Authorization': 'Client-ID 787933842b3b036',
            ...formData.getHeaders(),
            },
        });
    
        // Log the URL of the uploaded image
        console.log(imgurResponse.data.data.link);

        await page.click('#loginbutton');
        } catch (error) {
            console.error('Error uploading image:', error);
        }
}

const grabArticles = async (page) => {
    await page.waitForSelector("article a");

    await autoScroll(page, 5); //Change back to 20

    const articles = await page.$$eval('article a', anchors =>
        Array.from(new Set(
            anchors
                .map(anchor => anchor.href)
                .filter(href => /https:\/\/medium\.com\/(@[a-zA-Z0-9]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)(\?source=.*)?/g.test(href))
            ))
    );

    return(articles);
}

const generateMessage = async (headline, articleBody) => {
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

    await page.waitForSelector('div.pw-multi-vote-count button');

    const claps = await page.$eval(
        'div.pw-multi-vote-count button',
        (button) => button.textContent.trim()
    );
    
    if(!claps.includes("K")){
        throw new Error('Article does not have at least 1k claps');
    }

    const h1 = await page.$('h1[data-testid="storyTitle"]');
    const headline = await page.evaluate(element => element.textContent, h1);

    const paragraphs = await page.$$eval('p.pw-post-body-paragraph', elements => {
        return elements.map(element => element.textContent);
    });

    const articleBody = paragraphs.join('\n');

    await page.goto("https://medium.com/new-story");



    const obj = await generateMessage(headline, articleBody);



    await page.waitForSelector('h3');
    const headlineInput = await page.$('h3');

    await headlineInput.click();
    await headlineInput.type(obj.headline, { delay: 50 });

    await page.waitForSelector('p[data-testid="editorParagraphText"]');
    const articleBodyInput = await page.$('p[data-testid="editorParagraphText"]');
    
    await articleBodyInput.click();
    await articleBodyInput.type(obj.articleBody, {delay: 120});

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

module.exports = {login, grabArticles, writeArticle, polishArticle};