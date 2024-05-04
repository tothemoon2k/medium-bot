const Anthropic = require('@anthropic-ai/sdk');
const { autoScroll, delay } = require("./helper");
const {generatePrompt} = require("./prompts");

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_KEY,
});

const login = async (page) => {
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

    await page.type('#email', process.env.FACEBOOK_LOGIN_EMAIL, { delay: 250 });
    await page.type('#pass', process.env.FACEBOOK_LOGIN_PASSWORD, { delay: 250 });

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

    await page.waitForSelector('h1[data-testid="storyTitle"]', { timeout: 5000 });

    await delay(2000);

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
    
    let obj = JSON.parse(msg.content[0].text);

    await page.waitForSelector('h3');
    const headlineInput = await page.$('h3');

    await headlineInput.click();
    await headlineInput.type(obj.headline, { delay: 50 });

    await page.waitForSelector('p[data-testid="editorParagraphText"]');
    const articleBodyInput = await page.$('p[data-testid="editorParagraphText"]');
    
    await articleBodyInput.click();
    await articleBodyInput.type(obj.articleBody);

    return(obj);

}

const polishArticle = async (page, res) => {
    await delay(2000);

    const keywordStr = res.keywords.map(str => str.trim()).join('\n') + '\n';

    console.log(keywordStr);

    await page.waitForSelector('[data-testid="editorParagraphText"]');

    await page.click('[data-testid="editorParagraphText"]');

    await page.type('[data-testid="editorParagraphText"]', "hello\nhello2", {delay: 250});

    await delay(2000);
}

module.exports = {login, grabArticles, writeArticle, polishArticle};