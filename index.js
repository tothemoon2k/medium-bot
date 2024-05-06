require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const fs = require('fs');

const {login, grabArticles, writeArticle, polishArticle} = require("./components/core");
const {delay} = require("./components/helper");
const {authors} = require("./components/authors");
console.log(authors, "Authors");

const inputName = process.env.NODE_ENV === "production"
? process.argv[2]
: `${process.argv[2]} ${process.argv[3]}`

console.log(inputName, "Input name");

const author = authors.find(author => author.name === inputName);
console.log(author, "Author");



const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());



const run = async () => {
    const browser = await puppeteer.launch({
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
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
        console.log("Login failed...");
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
    console.log(`An error occurred - ${inputName}`, error)
}

