const generatePrompt = (headline, articleBody) => {
    return(`
        Please reword the following medium article and headline in a similar style, please make the article about 900 words long and value packed. Please return only a valid json object with four properties - headline, articleBody, hook(120 character compelling hook), keywords(array of 5 best medium topics for this article). Please make sure the json is and All string values are enclosed in double quotes.
        Newline characters within the text are escaped (\n) to maintain the string's structure within valid JSON syntax.

        """"
        Headline: ${headline},
        Article Body: ${articleBody},
        """"


        Here is the json object:
    `)
}

module.exports = {generatePrompt};