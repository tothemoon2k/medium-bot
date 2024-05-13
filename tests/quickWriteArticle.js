require('dotenv').config();
const fs = require('fs');
const tmpDir = '/tmp';

const { puppeteer, proxyChain, StealthPlugin, login, grabArticles, writeArticle, polishArticle, sendSuccessEmail, sendErrorEmail, delay, authors, proxies } = require("../components");


const runTest1 = async () => {
    const author = {
        name: "Joel Orion",
        email: "joelorion13@gmail.com",
        topic: "business",
        pass: ""
    };

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
            headless: false,
    });

    const page = await browser.newPage();

    await login(page, author);

    await page.waitForSelector("h2", { timeout: 60000 });

    await delay(3000);

    await page.goto('https://plus.unsplash.com/premium_photo-1669058431851-aae101e63b61?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

    await page.waitForSelector("img");

    await delay(3000);

    const imageElement = await page.$('img');
    await imageElement.click({ button: 'right' });

    await delay(2000);

    //Work yo magic twin

    await delay(2000);

    await page.goto("https://medium.com/new-story");

    await page.waitForSelector('p[data-testid="editorParagraphText"]', { timeout: 60000 });

    const articleBodyInput = await page.$('p[data-testid="editorParagraphText"]');
    await articleBodyInput.click();

    await page.keyboard.down('Control');
    await page.keyboard.press('V');
    await page.keyboard.up('Control');
}

const runTest2 = async () => {
    fs.writeFileSync(`${tmpDir}/example.txt`, 'Hello, World!');

    // Read from a file in the /tmp directory
    const data = fs.readFileSync(`${tmpDir}/example.txt`, 'utf8');
    console.log(data); // Output: Hello, World!
}

runTest2();

