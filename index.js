require('dotenv').config();

const { puppeteer, proxyChain, StealthPlugin, login, grabArticles, writeArticle, polishArticle, sendSuccessEmail, sendErrorEmail, delay, authors, proxies } = require("./components");

puppeteer.use(StealthPlugin());

const run = async () => {
    const author = authors.find(author => author.name === `${process.argv[2]} ${process.argv[3]}`);
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
    
    console.log(`Logging into ${author.name}...`);
    try {
        await login(page, author);
        console.log("Login Success");
    } catch (error) {
        console.log("Login failed...", error);
        await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
        await sendErrorEmail();
        browser.close();
    }
    
    console.log("Navigating to topic page...")
    await page.waitForSelector("h2", { timeout: 60000 });

    await delay(5000);

    await page.goto(`https://medium.com/?tag=${author.topic}`);

    console.log(`Scrapping ${author.topic} topic page...`);

    let articles;

    try {
        articles = await grabArticles(browser, page);
        console.log(`Successfully scrapped ${author.topic} topic page and gathered ${articles.length} articles`)
    } catch (error) {
        console.log(`There was an error scrapping ${author.topic} topic page`, error);
    }

    for(let article of articles){
        try {
            console.log("Writing an article...");
            const res = await writeArticle(page, article);

            await page.click('button[data-action="show-prepublish"]');
    
            await polishArticle(page, res);
    
            await page.click(`button[data-action="publish"][data-testid="publishConfirmButton"]`);

            await delay(8000);

            try {
                await page.waitForSelector('h3[data-testid="publishSuccessTitleText"]', { timeout: 60000 });
                console.log("Successfully posted an article");
            } catch (error) {
                console.log("Maximum Articles Posted");
                await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
                await sendSuccessEmail("justin2013pdx@gmail.com", "Justin Garner", author.name);
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
    sendErrorEmail();
    console.log(`An error occurred - ${process.argv[2]} ${process.argv[3]}`, error);

}
