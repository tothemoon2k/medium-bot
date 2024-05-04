const autoScroll = async (page, maxScrolls = 10) => {
    const scrollHeight = 'document.body.scrollHeight';

    for (let i = 0; i < maxScrolls; i++) {
        const lastHeight = await page.evaluate(scrollHeight);

        await page.evaluate(`window.scrollBy(0, ${scrollHeight})`);

        await page.waitForFunction(
            newHeight => document.body.scrollHeight > newHeight,
            {}, lastHeight
        );
    }
};

const delay = (time) => {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

module.exports = {autoScroll, delay};