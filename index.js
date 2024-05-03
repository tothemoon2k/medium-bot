const puppeteer = require('puppeteer-extra');
const fs = require('fs');
require('dotenv').config()

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

    await page.type('#email', process.env.FACEBOOK_LOGIN_EMAIL);
    await page.type('#pass', process.env.FACEBOOK_LOGIN_PASSWORD);

    await page.click('#loginbutton');

    await delay(5000);

    await page.goto('https://medium.com/?tag=money');

    await delay(5000);

    async function autoScroll(page){
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    await autoScroll(page);

    let articles = await page.$$('a.az.ak.ba.bb.bc.an.bd.w.ao.ap.aq.ar.as.at.au');

    let count = 0;
    for (const article of articles) {

        const href = await article.evaluate((el) => el.href);
        const text = await article.evaluate((el) => el.textContent);
        if(href.includes('@')){
            console.log(`URL: ${href}`);
            console.log(`Text: ${text}`);
            console.log('---');
            count++
        }
    }

    console.log(count);

    //await page.click('a[data-testid="headerWriteButton"]');
}

test();

