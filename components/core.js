const Anthropic = require('@anthropic-ai/sdk');
const { autoScroll } = require("./helper");
const {generatePrompt} = require("./prompts");

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

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
    /*
    await autoScroll(page);
    */

    const articles = await page.$$eval('article a', anchors =>
        Array.from(new Set(
            anchors
                .map(anchor => anchor.href)
                .filter(href => /https:\/\/medium\.com\/(@[a-zA-Z0-9]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)(\?source=.*)?/g.test(href))
            ))
    );

    return(articles);

    /*
    let count = 0;
    let formattedArticles = [];

    for (const article of articles) {
        const href = await article.evaluate((el) => el.href);
        const text = await article.evaluate((el) => el.textContent);
        if(href.includes('@')){
            formattedArticles.push({href: href, text: text});
            count++
        }
    }

    console.log(`Total articles found: ${count}`);
    return(formattedArticles);
    */
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

    const articleBody = paragraphs.join('\n'); // Use '\n' to separate paragraphs

    console.log(headline, articleBody);

    await page.goto("https://medium.com/new-story");

    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_KEY,
    });

    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        messages: [{ role: "user", content: generatePrompt(headline, articleBody) }],
    });

    console.log(msg.content[0].text);
    
    let obj = JSON.parse(msg.content[0].text);

    console.log(obj)

    await page.waitForSelector('h3');
    const elementToClick = await page.$('h3');

    await elementToClick.click();
    await elementToClick.type(obj.headline, { delay: 50 });

    await page.waitForSelector('p[data-testid="editorParagraphText"]');
    const elementToType = await page.$('p[data-testid="editorParagraphText"]');
    
    await elementToType.click();
    await elementToType.type(obj.articleBody);

    return(obj);

}

const polishArticle = async (page, res) => {
    await delay(2000);

    const keywordStr = res.keywords.map(str => str.trim()).join('\n') + '\n';

    console.log(keywordStr);

    await page.waitForSelector('[data-testid="editorParagraphText"]');

    await page.click('[data-testid="editorParagraphText"]');

    await page.type('[data-testid="editorParagraphText"]', "hello\nhello2", {delay: 250});
}

module.exports = {login, grabArticles, writeArticle, polishArticle};