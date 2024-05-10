const puppeteer = require('puppeteer-extra');
const proxyChain = require('proxy-chain');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const {login, grabArticles, writeArticle, polishArticle} = require("./core");
const {sendSuccessEmail, sendErrorEmail} = require("./emails");
const {delay} = require("./helper");
const {authors} = require("./authors");
const {proxies} = require("./proxies");
const {queryImg} = require("./image");

module.exports = {
    puppeteer,
    proxyChain,
    StealthPlugin,
    login,
    grabArticles,
    writeArticle,
    polishArticle,
    sendSuccessEmail,
    sendErrorEmail,
    delay,
    authors,
    proxies,
    queryImg
}