require('dotenv').config();
const fs = require('fs');
const tmpDir = '/tmp';

const { puppeteer, proxyChain, StealthPlugin, login, grabArticles, writeArticle, polishArticle, sendSuccessEmail, sendErrorEmail, delay, authors, proxies } = require("../components");

puppeteer.use(StealthPlugin());

const runTest1 = async () => {
    const author = {
        name: "Joel Orion",
        email: "joelorion13@gmail.com",
        topic: "business",
        pass: process.env.JOEL_ORION_FB_PASS //REMOVE TEXT BEFORE COMMITTING TO GIT
    };

    const newProxyUrl = await proxyChain.anonymizeProxy(proxies[Math.floor(Math.random() * proxies.length)]);

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

    await login(page, author);

    await page.waitForSelector("h2", { timeout: 60000 });

    await delay(3000);

    const imageUrl = 'https://plus.unsplash.com/premium_photo-1669048776605-28ea2e52ae66?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

    const viewSource = await page.goto(imageUrl);
    const buffer = await viewSource.buffer();
    fs.writeFileSync(`${tmpDir}/image.png`, buffer);

    await page.goto("https://medium.com/new-story");
    await page.waitForSelector('h3', { timeout: 60000 });

    await page.waitForSelector('[data-testid="editorAddButton"]');

    // Click the button
    await page.click('[data-testid="editorAddButton"]');

    await delay("2000");

    const [fileChooser] = await Promise.all([
        page.waitForFileChooser(),
        page.click('button[aria-label="Add an image"]')
    ]);
    await fileChooser.accept([`${tmpDir}/image.png`]);
}

const runTest2 = async () => {
    fs.writeFileSync(`${tmpDir}/example.txt`, 'Hello, World!');

    // Read from a file in the /tmp directory
    const data = fs.readFileSync(`${tmpDir}/example.txt`, 'utf8');
    console.log(data); // Output: Hello, World!
}

runTest1();

