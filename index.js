require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const proxyChain = require('proxy-chain');

const {login, grabArticles, writeArticle, polishArticle} = require("./components/core");
const {delay} = require("./components/helper");
const {authors} = require("./components/authors");

const author = authors.find(author => author.name === `${process.argv[2]} ${process.argv[3]}`);
console.log(author, "Author");

//ADD PROXY CLEAN UP!!!!!

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const run = async () => {
    const newProxyUrl = await proxyChain.anonymizeProxy("http://topperbrown2k_gmail_com-country-us-sid-ar7yhbfvqzrxeo-filter-medium:qbi5zdnlus@gate.nodemaven.com:8080");

    console.log(newProxyUrl);

    const browser = await puppeteer.launch({
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
          `--proxy-server=${newProxyUrl}`,
        ],
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
            headless: true,
    });

    const page = await browser.newPage();
    
    console.log(`Logging into ${author.name}...`);
    try {
        await login(page, author);
        console.log("Login Success");
    } catch (error) {
        console.log("Login failed...", error);
        await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
        browser.close();
    }
    
    console.log("Navigating to topic page...")
    await page.waitForSelector("h2.am.fh.fi.ah.fj.bq");

    await delay(5000);

    await page.goto(`https://medium.com/?tag=${author.topic}`);

    console.log(`Scrapping ${author.topic} topic page...`);

    let articles;

    try {
        articles = await grabArticles(page);
        console.log(`Successfully scrapped ${author.topic} topic page and gathered ${articles.length}`)
    } catch (error) {
        console.log(`There was an error scrapping ${author.topic} topic page`, error);
    }

    for(let article of articles){
        try {
            const res = await writeArticle(page, article);
            console.log("Writing an article...");

            await page.click('button[data-action="show-prepublish"]');
    
            await polishArticle(page, res);
    
            await page.click(`button[data-action="publish"][data-testid="publishConfirmButton"]`);

            await delay(8000);

            try {
                await page.waitForSelector('h3[data-testid="publishSuccessTitleText"]');
                console.log("Successfully posted an article");
            } catch (error) {
                console.log("Maximum Articles Posted");
                await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
                browser.close();
                break;
            }
        } catch (error) {
            console.log("An error occurred with this article", error);
        }
    }
}

try {
    run();
} catch (error) {
    console.log(`An error occurred - ${process.argv[2]} ${process.argv[3]}`, error)
}

