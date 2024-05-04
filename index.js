const puppeteer = require('puppeteer-extra');
const fs = require('fs');
require('dotenv').config();

const {login, grabArticles, writeArticle, polishArticle} = require("./components/core");

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

const test = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        // headless: "new",
        // devtools: true,
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true,
        //Executable path for mac
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    });

    const page = await browser.newPage();
    
    await login(page);

    await delay(5000);

    await page.goto('https://medium.com/?tag=money');

    await delay(5000);

    const articles = await grabArticles(page);

    console.log(articles)

    for(let article of articles){
        try {
            const res = await writeArticle(page, article.href);

            await page.click('button[data-action="show-prepublish"]');
    
            await polishArticle(page, res);
    
            await delay(1000);
    
            await page.click(`button[data-action="publish"][data-testid="publishConfirmButton"]`);
        } catch (error) {
            console.log("Article didn't work ☹️", error);
        }
    }

    

    /*
    await page.waitForSelector('div.js-customTitleControlSubtitle');
    const hookElement = await page.$('div.js-customTitleControlSubtitle');
    await hookElement.click();
    await hookElement.type(res.hook, { delay: 150 })
    */
}

test();

