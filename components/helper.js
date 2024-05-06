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

const screenShot = async (page) =>{
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

    console.log(imgurResponse.data.data.link);
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

module.exports = {delay, autoScroll, screenShot};