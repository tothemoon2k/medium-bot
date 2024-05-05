require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const fs = require('fs');

const {login, grabArticles, writeArticle, polishArticle} = require("./components/core");
const {delay} = require("./components/helper");
const {authors} = require("./components/authors");
const author = authors.find(author => author.name === `${process.argv[2]} ${process.argv[3]}`);



const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());



const run = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true,
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    });

    const page = await browser.newPage();
    
    await login(page, author);

    await page.waitForSelector("h2.am.fh.fi.ah.fj.bq");
    await page.goto(`https://medium.com/?tag=${author.topic}`);


    const articles = await grabArticles(page);

    console.log(articles.length)

    for(let article of articles){
        try {
            const res = await writeArticle(page, article);

            await page.click('button[data-action="show-prepublish"]');
    
            await polishArticle(page, res);
    
            await page.click(`button[data-action="publish"][data-testid="publishConfirmButton"]`);

            await delay(8000);

            try {
                await page.waitForSelector('h3[data-testid="publishSuccessTitleText"]');
                console.log("Successfully posted an article");
            } catch (error) {
                console.log("Maximum Articles Posted");
                browser.close();
                break;
            }
        } catch (error) {
            console.log("Article didn't work ☹️", error);
        }
    }

    /*
    Custom Hook

    await page.waitForSelector('div.js-customTitleControlSubtitle');
    const hookElement = await page.$('div.js-customTitleControlSubtitle');
    await hookElement.click();
    await hookElement.type(res.hook, { delay: 150 })
    */
}

try {
    run();
} catch (error) {
    console.log(`An error occurred - ${process.argv[2]} ${process.argv[3]}`, error)
}

