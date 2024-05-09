require('dotenv').config();
const axios = require("axios");

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
           "email": "noreply@themediumbot.com"
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
           "email": "noreply@themediumbot.com"
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

module.exports = {sendSuccessEmail, sendErrorEmail};