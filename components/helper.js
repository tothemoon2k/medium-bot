const autoScroll = async (page, maxScrolls = 10) => {
    let scrolls = 0;

    await page.evaluate(async (maxScrolls) => {
        await new Promise((resolve, reject) => {
            const scrollInterval = setInterval(() => {
                window.scrollBy(0, window.innerHeight);
                scrolls++;
                console.log(scrolls)

                if (scrolls >= maxScrolls || window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                    clearInterval(scrollInterval);
                    resolve();
                }
            }, 100);
        });
    }, maxScrolls);
};

module.exports = {autoScroll};