const generateHeadlinePrompt = (headline) => {
    return(`
        Please reword the following headline in a similar style, the article will be value packed and focused on a engaging personal story, hidden life wisdom and deep knowledge. 
        Please make the articles value clear(not clever) through the headline and the reader should always be the hero. 
        Please make the headline clear, not vague. The headline should be easy to read and understand. 
        Please return only the headline. No extra text, no explanation ect.

        """"
        Headline to reword: ${headline},
        """"

    `)
}

const generateArticlePrompt = (articleBody, imgURL) => {
    return(`
        Please reword the following medium article in a similar style, the article should be value packed and focused on a engaging personal story, hidden life wisdom and deep knowledge. 
        Please make the article's value clear(not clever) and the reader should always be the hero. 
        Please make the article clear, not vague. The article should be easy to read and understand. 
        Please write the article in html.
        Please create an <img> element with the provided Image URL below as the source, and place this <img> element at the beginning of the article.
        Please make sure to make use of h1 and paragraph elements to engage the reader.
        Please ensure the article is 700-900 words long.
        Please return only the article. No extra text, no explanation ect.

        """"
        Article Body: ${articleBody},
        Image URL: ${imgURL},
        """"
    `)
}

const generateHookPrompt = (headline, articleBody) => {
    return(`
        Please write a compelling hook for the following headline and article. 
        Please make the articles value clear(not clever) and the reader should always be the hero. 
        Please make the hook clear, not vague. The hook should be easy to read and understand. 
        Please make the hook simple and value/dream outcome very clear.
        Please make the hook 120 characters or less.
        Please return only the hook. No extra text, no explanation ect.

        """"
        Headline: ${headline},
        Article Body: ${articleBody},
        """"
    `)
}

const generateKeywordsPrompt = (headline, articleBody) => {
    return(`
        Please return the 5 best medium topics for the following headline and article.
        Please pick top topics that match the content.
        Each topic should be under 10 characters long.
        Please return only the topics. No extra text, no explanation ect.
        Please separate each value with a comma and no space. Ex. topic1,topic2,topic3,topic4,topic5

        """"
        Headline: ${headline},
        Article Body: ${articleBody},
        """"
    `)
}

const generateAllPrompts = (headline, articleBody, imgURL) => {
    const headlinePrompt = generateHeadlinePrompt(headline, articleBody, imgURL);
    const articlePrompt = generateArticlePrompt(articleBody, imgURL);
    const hookPrompt = generateHookPrompt(headline, articleBody, imgURL);
    const keywordsPrompt = generateKeywordsPrompt(headline, articleBody);
    return([headlinePrompt, articlePrompt, hookPrompt, keywordsPrompt])
}

module.exports = {generateAllPrompts};