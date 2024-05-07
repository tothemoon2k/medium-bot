require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { autoScroll, delay } = require("./helper");
const { generatePrompt } = require("./prompts");
const axios = require("axios");

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_KEY,
});

const login = async (page, author) => {
    await page.goto('https://medium.com');
    await page.waitForNetworkIdle();

    await page.goto("https://medium.com/m/signin");

    await delay(4000);

    const links = await page.$$eval('a', links => {
        return links.map(link => link.href) 
    })

    const facebookUrl = links.find(url => url.includes('facebook'));

    await page.goto(facebookUrl);

    await page.waitForSelector("#email", { timeout: 60000 });

    await delay(2000);

    await page.type('#email', author.email, { delay: 250 });
    await page.type('#pass', author.pass, { delay: 250 });

    await page.click('#loginbutton');
}

const grabArticles = async (page) => {
    await page.waitForSelector("article a", { timeout: 60000 });

    await autoScroll(page, 5); //Change back to 20

    const articles = await page.$$eval('article a', anchors =>
        Array.from(new Set(
            anchors
                .map(anchor => anchor.href)
                .filter(href => /https:\/\/medium\.com\/(@[a-zA-Z0-9]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)(\?source=.*)?/g.test(href))
            ))
    );

    return(articles);
}

const generateMessage = async (headline, articleBody) => {
    const prompt = generatePrompt(headline, articleBody);
    const requestParams = {
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    };
  
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await anthropic.messages.create(requestParams);
        return JSON.parse(response.content[0].text);
      } catch (error) {
        console.error(`Failed to generate message (Attempt #${attempt + 1}):`, error);
      }
    }
  
    console.error("Failed to generate message after two attempts.");
    return null;
 };

const writeArticle = async (page, link) => {
    await page.goto(link);

    await page.waitForSelector('div.pw-multi-vote-count button', { timeout: 60000 });

    const claps = await page.$eval(
        'div.pw-multi-vote-count button',
        (button) => button.textContent.trim()
    );
    
    if(!claps.includes("K")){
        throw new Error('Article does not have at least 1k claps');
    }

    const h1 = await page.$('h1[data-testid="storyTitle"]');
    const headline = await page.evaluate(element => element.textContent, h1);

    const paragraphs = await page.$$eval('p.pw-post-body-paragraph', elements => {
        return elements.map(element => element.textContent);
    });

    const articleBody = paragraphs.join('\n');

    await page.goto("https://medium.com/new-story");



    const obj = await generateMessage(headline, articleBody);



    await page.waitForSelector('h3', { timeout: 60000 });
    const headlineInput = await page.$('h3');

    await headlineInput.click();
    await headlineInput.type(obj.headline, { delay: 50 });

    await page.waitForSelector('p[data-testid="editorParagraphText"]', { timeout: 60000 });
    const articleBodyInput = await page.$('p[data-testid="editorParagraphText"]');
    
    await articleBodyInput.click();
    await articleBodyInput.type(obj.articleBody, {delay: 70});

    return(obj);
}

const polishArticle = async (page, res) => {
    await delay(2000);

    const keywordStr = res.keywords.map(str => str.trim()).join(', ') + ',';

    const inputField = await page.$('.js-tagInput.tags-input.editable')
    await inputField.click();
    await page.type('.js-tagInput.tags-input.editable', keywordStr, {delay: 250});

    await delay(2000);
}

const sendSuccessEmail = async (email, name, authorName) => {
    let headers = {
        'accept': 'application/json',
        'api-key': process.env.BREVO_KEY,
        'content-type': 'application/json'
    };

    const html = `
                <html>
                    <head>
                    <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet">
                    </head>
                    <style>
                        body {
                        text-align: center;
                        padding: 40px 0;
                        background: #EBF0F5;
                        }
                        h1 {
                            color: #88B04B;
                            font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
                            font-weight: 900;
                            font-size: 40px;
                            margin-bottom: 10px;
                        }
                        p {
                            color: #404F5E;
                            font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
                            font-size:20px;
                            margin: 0;
                        }
                        i {
                        color: #9ABC66;
                        font-size: 100px;
                        line-height: 200px;
                        margin-left:-15px;
                        }
                        .card {
                        background: white;
                        padding: 60px;
                        border-radius: 4px;
                        box-shadow: 0 2px 3px #C8D0D8;
                        display: inline-block;
                        margin: 0 auto;
                        }
                    </style>
                    <body>
                        <div class="card">
                        <div style="border-radius:200px; height:200px; width:200px; background: #F8FAF5; margin:0 auto;">
                        <i class="checkmark">✓</i>
                        </div>
                        <h1>Success</h1> 
                        <p>Posted 15 articles to ${authorName} medium account!</p>
                        </div>
                    </body>
                </html>
                `

    let data = {
        "sender": {
           "name": "Medium Bot",
           "email": "mediumbot@mediumbot.mp"
        },
        "to": [
           {
              "email": email,
              "name": name
           }
        ],
        "subject": `Successfully posted 15 articles to ${authorName} medium account today!`,
        "htmlContent": html
        };
        axios.post('https://api.brevo.com/v3/smtp/email', data, { headers })
           .then(async response => {
                 console.log("Email Sent Successfully", response);
           })
           .catch(error => {
                 console.log("There was an error sending the email, please try again", error)
           });
}

const sendErrorEmail = async (email, name, authorName, error) => {
    let headers = {
        'accept': 'application/json',
        'api-key': process.env.BREVO_KEY,
        'content-type': 'application/json'
    };

    const html = `
                <html>
                    <head>
                    <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet">
                    </head>
                    <style>
                        body {
                            text-align: center;
                            padding: 40px 0;
                            background: #ebf0f5;
                        }

                        h1 {
                            color: #d62828; /* Changed color to red */
                            font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
                            font-weight: 900;
                            font-size: 40px;
                            margin-bottom: 10px;
                        }

                        p {
                            color: #404f5e;
                            font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
                            font-size: 20px;
                            margin: 0;
                        }

                        i {
                            color: #d62828; /* Changed color to red */
                            font-size: 100px;
                            line-height: 200px;
                            margin-left: -15px;
                        }

                        .card {
                            background: white;
                            padding: 60px;
                            border-radius: 4px;
                            box-shadow: 0 2px 3px #c8d0d8;
                            display: inline-block;
                            margin: 0 auto;
                        }
                        </style>

                        <body>
                            <div class="card">
                                <div
                                style="
                                    border-radius: 200px;
                                    height: 200px;
                                    width: 200px;
                                    background: #faf5f5; /* Changed background color to light red */
                                    margin: 0 auto;
                                "
                                >
                                <i class="checkmark">x</i>
                                </div>
                                <h1>Error</h1>
                                <p>
                                    Error posting articles to ${authorName} medium account! Check this out in
                                    greater detail. 
                                    <br/> <br/>
                                    ${error}
                                </p>
                            </div>
                        </body>
                </html>
                `

    let data = {
        "sender": {
           "name": "Medium Bot",
           "email": "mediumbot@mediumbot.mp"
        },
        "to": [
           {
              "email": email,
              "name": name
           }
        ],
        "subject": `Successfully posted 15 articles to ${authorName} medium account today!`,
        "htmlContent": html
        };
        axios.post('https://api.brevo.com/v3/smtp/email', data, { headers })
           .then(async response => {
                 console.log("Email Sent Successfully", response);
           })
           .catch(error => {
                 console.log("There was an error sending the email, please try again", error)
           });
}

module.exports = {login, grabArticles, writeArticle, polishArticle, sendSuccessEmail, sendErrorEmail};