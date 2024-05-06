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

module.exports = {delay, autoScroll};