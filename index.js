require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const FormData = require('form-data');
const axios = require("axios");

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

        await delay(3000);

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
        } catch (error) {
            console.error('Error uploading image:', error);
        }

    } catch (error) {
        console.log("Login failed...", error);
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

