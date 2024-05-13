const generatePrompt = (headline, articleBody) => {
    return(`
        Please reword the following medium article and headline in a similar style, the article should be value packed and focused on a engaging personal story, hidden life wisdom and deep knowledge. Please makes the articles value clear(not clever) and the reader should always be the hero. Please make the article + headline clear, not vague + easy to read and understand. Please make the hook simple and value/dream outcome very clear. Please return only a valid json object with four properties - headline, articleBody(MUST 700-900 words in total length), hook(120 character compelling hook), keywords(array of 5 best medium topics for this article). Please double check the JSON object is 100% valid, make sure the json is and All string values are enclosed in double quotes.
        Newline characters within the text are escaped (\n) to maintain the string's structure within valid JSON syntax.

        """"
        Headline: ${headline},
        Article Body: ${articleBody},
        """"


        Here is the json object:
    `)
}

module.exports = {generatePrompt};