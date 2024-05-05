const Anthropic = require('@anthropic-ai/sdk');
const { autoScroll, delay } = require("./helper");
const {generatePrompt} = require("./prompts");

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

    await page.click('#loginbutton');
}

const grabArticles = async (page) => {
    await page.waitForSelector("article a");

    await autoScroll(page, 5);

    const articles = await page.$$eval('article a', anchors =>
        Array.from(new Set(
            anchors
                .map(anchor => anchor.href)
                .filter(href => /https:\/\/medium\.com\/(@[a-zA-Z0-9]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)(\?source=.*)?/g.test(href))
            ))
    );

    return(articles);
}

const writeArticle = async (page, link) => {
    await page.goto(link);

    await page.waitForSelector('div.pw-multi-vote-count button');

    const claps = await page.$eval(
        'div.pw-multi-vote-count button',
        (button) => button.textContent.trim()
    );

    console.log(claps)
    
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

    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        messages: [{ role: "user", content: generatePrompt(headline, articleBody) }],
    });

    //try catch with trying claude again

    let obj

    try {
        obj = JSON.parse(msg.content[0].text);
    } catch (error) {
        console.log(error);

        console.log("JSON Failed. Trying to generate json again.")

        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 4000,
            messages: [{ role: "user", content: generatePrompt(headline, articleBody) }],
        });

        obj = JSON.parse(msg.content[0].text);
    }

    await page.waitForSelector('h3');
    const headlineInput = await page.$('h3');

    await headlineInput.click();
    await headlineInput.type(obj.headline, { delay: 150 });

    await page.waitForSelector('p[data-testid="editorParagraphText"]');
    const articleBodyInput = await page.$('p[data-testid="editorParagraphText"]');
    
    await articleBodyInput.click();
    await articleBodyInput.type(obj.articleBody);

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