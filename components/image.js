require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const axios = require("axios");
const base64Img = require('base64-img');

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_KEY,
});

const generatePrompt = async (headline) => {
    const prompt = `Please write a great midjourney prompt to generate an image for the following medium article, please make it be as realistic as possible and low-complexity for midjourney yet very fitting to article never include any text, if it makes sense include cute girl ${headline}. Please return prompt only, no other text.`;
    const requestParams = {
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    };

    const response = await anthropic.messages.create(requestParams);
    return response.content[0].text;
};

const getImages = async (prompt) => {
    let imageId;
    let imagesArr;

    const data = {
        prompt: prompt
    };
     
    try{
        const response = await axios.post('http://cl.imagineapi.dev/items/images/', data, {
            headers: {
                'Authorization': `Bearer ${process.env.IMAGINEDEV_KEY}`,
                'Content-Type': 'application/json'
            }
        })

        imageId = response.data.data.id;
        console.log(imageId);
    }catch(err){
        console.log("An error occurred:" + err);
    }

    return new Promise((resolve, reject) => {
        let intervalId;
        const fetchImageData = async () => {
          try {
            const response = await axios.get(`https://cl.imagineapi.dev/items/images/${imageId}`, {
              headers: {
                'Authorization': `Bearer ${process.env.IMAGINEDEV_KEY}`,
                'Content-Type': 'application/json'
              }
            });
    
            if (response.data.data.status === "completed") {
              clearInterval(intervalId);
              imagesArr = response.data.data.upscaled_urls;
              resolve(imagesArr); // Resolve the Promise with the imagesArr
            }
          } catch (error) {
            console.error('Error', error);
            reject(error); // Reject the Promise if an error occurs
          }
        };
    
        intervalId = setInterval(fetchImageData, 3000);
    });
}

const chooseImg = async (headline, urls) => {
    const content = [];

    for(let url of urls){
        const res = await axios.get(url, {responseType: 'arraybuffer'})

        content.push(
            {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: res.headers['content-type'],
                  data: Buffer.from(res.data, 'binary').toString('base64'),
                },
              },
        )
    }

    content.push({
        type: "text",
        text: `Which of the following images best matches the following criteria: looks the least AI generated, includes a cute girl, would get the most views for a medium article and best matches this headline: ${headline}. Please only return a number 1-4 corresponding to your pick, no explanation at all.`
    })

    const requestParams = {
        model: "claude-3-sonnet-20240229",
        max_tokens: 4000,
        messages: [
            {
                role: 'user',
                content: content,
              },
        ]
    };
  
    const response = await anthropic.messages.create(requestParams);

    return response.content[0].text;
}

const queryImg = async (headline) => {
    const prompt = await generatePrompt(headline);
    console.log(prompt);

    const optionsUrls = await getImages(prompt);

    console.log(optionsUrls);
    
    const chosenNum = await chooseImg(headline, optionsUrls);

    console.log(chosenNum);

    const chosenImg = optionsUrls[Number(chosenNum) - 1];

    console.log(chosenImg);

    return chosenImg;
}

module.exports = {queryImg};