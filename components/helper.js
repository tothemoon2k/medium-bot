const axios = require("axios");
const FormData = require('form-data');

const delay = (time) => {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
};

const autoScroll = async (page, maxScrolls = 10) => {
    const scrollHeight = 'document.body.scrollHeight';

    for (let i = 0; i < maxScrolls; i++) {
        await delay(2000);
        const lastHeight = await page.evaluate(scrollHeight);

        await page.evaluate(`window.scrollBy(0, ${scrollHeight})`);

        await page.waitForFunction(
            newHeight => document.body.scrollHeight > newHeight,
            {}, lastHeight
        );
    }
};

const filterArticlesByClaps = async (browser, articles) => {
    const filteredArticles = [];
    const newPage = await browser.newPage();

    for (let link of articles) {
        await newPage.goto(link);
        await newPage.waitForSelector('div.pw-multi-vote-count button', { timeout: 60000 });

        const claps = await newPage.$eval(
            'div.pw-multi-vote-count button',
            (button) => button.textContent.trim()
        );

        if (Number(claps) >= 300) {
            filteredArticles.push(link);
        }
    }

    newPage.close();

    return filteredArticles;
};

module.exports = {delay, autoScroll, filterArticlesByClaps};