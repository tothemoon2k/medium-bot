require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { autoScroll, delay, filterArticlesByClaps } = require("./helper");
const { generatePrompt } = require("./prompts");
const {queryImg} = require("./image");

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

const grabArticles = async (browser, page) => {
    await page.waitForSelector("article a", { timeout: 60000 });

    await autoScroll(page, 7);

    let allArticles = [];

    while (allArticles.length < 20) {
        const articles = await page.$$eval('article a', anchors =>
            Array.from(new Set(
                anchors
                    .map(anchor => anchor.href)
                    .filter(href => /https:\/\/medium\.com\/(@[a-zA-Z0-9]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+|[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+)(\?source=.*)?/g.test(href))
                    .filter(href => !href.includes("/tag/"))
                ))
        );

        const filteredArticles = await filterArticlesByClaps(browser, articles);
        
        allArticles = [...allArticles, ...filteredArticles];

        console.log(`Found ${allArticles.length} 1k articles so far`);

        if (allArticles.length < 20) {
            await autoScroll(page, 3);
        }
    }

    return allArticles;
};

const generateArticle = async (headline, articleBody) => {
    const prompt = generatePrompt(headline, articleBody);
    const requestParams = {
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    };
  
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await anthropic.messages.create(requestParams);
        console.log(response.content[0].text);
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

    const h1 = await page.$('h1[data-testid="storyTitle"]');
    const headline = await page.evaluate(element => element.textContent, h1);

    const paragraphs = await page.$$eval('p.pw-post-body-paragraph', elements => {
        return elements.map(element => element.textContent);
    });

    const articleBody = paragraphs.join('\n');

    await page.goto("https://medium.com/new-story");

    /*
    const imgUrl = await queryImg("About Me & My To Promote Actionable  Business Advice");
    console.log(imgUrl);
    */

    await page.waitForSelector('p[data-testid="editorParagraphText"]', { timeout: 60000 });

    const obj = await generateArticle(headline, articleBody);

    await page.waitForSelector('h3', { timeout: 60000 });
    const headlineInput = await page.$('h3');

    await headlineInput.click();
    await headlineInput.type(obj.headline, { delay: 50 });

    await page.waitForSelector('p[data-testid="editorParagraphText"]', { timeout: 60000 });
    const articleBodyInput = await page.$('p[data-testid="editorParagraphText"]');
    
    await articleBodyInput.click();
    await articleBodyInput.type(obj.articleBody); //Add delay back {delay: 70}

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

const testMe = async () => {
    console.log(await generateArticle("Almond Milk is Ancient History: A Vegetarian History of Milk Alternatives", `The numerous plant-based milk alternatives on the market today seem like a modern phenomena, but these products aren’t new. Plant-derived alternatives to milk have been around for centuries, and were utilized by British and American vegetarians and vegans as beverages and in cooking.
    One of the oldest dairy alternatives, soy milk’s origins began in China, where it was first mentioned in written records in the year 1365. The invention of the hand-turned stone mill was essential in the development of soy milk, which allowed soybeans to be ground to make the first soy milk and tofu. The creation and consumption of soy milk spread to other cultures in East Asia, but did not reach further into Western cultures until much later. Not until the early 20th century was soy milk accessible in Western countries.
    An illustration of a soybean plant with small flowers and green pods.
    Soybean Leiden University Libraries Public Domain
    In a 1908 issue of the British periodical The Epicure, an article describes the process of creating condensed soy milk. The article highlighted the product as being of potential interest to vegetarians.
    This condensed vegetable milk is of a yellowish colour, and has a very pleasant taste hardly to be distinguished from the real cow’s milk. However, it still retains the aroma of the soja bean. It is said to form a cheap and good substitute for condensed cow’s milk. Vegetarian cooks will probably find it of some value in cases where ordinary cow’s milk is to be avoided. (p. 184)
    A photograph of a glass bottle of soy milk with a string tied around the top rim. There is a ceramic dish with dried soybeans and across from this in a matching ceramic dish are soybean pods. The bottle of soy milk and dried beans are placed on a folded blue cloth with a scattering of loose soybeans. Everything is sitting on a wooden surface and the background is blurred.
    Soy Milk by Kjokkenutstyr.net Wikimedia Commons Image License
    In seeking milk substitutes, the Brosimum utile, or cow-tree was of interest to 19th century vegetarians. This member of the mulberry family produced a white sap that was described as a “vegetable milk”. Cultivation of the cow-tree or the manufacture of its sap as a form of milk substitute did not seem to occur in Europe or North America. For substituting cow’s milk, the sap cow tree was superseded by a different product from trees — nuts.
    An illustration of a coconut tree with enlarged images of the coconut, the inside of a coconut, and a section of the coconut showing the thickness of the coconut.
    Coconut Wikimedia Commons Public Domain
    The term coconut milk was first recorded in English in 1698, but this tropical milk alternative already had a lengthy culinary history. By 1 BC coconut milk was already a staple food across Southeast Asia and India. Western vegetarians began using coconut milk in the late 19th and early 20th century for cooking and as a beverage. Coconuts were one of the main ingredients in Victorian era milk alternatives. This 1896 recipe found in what would be described as a vegan cookbook, titled The Fat of the Land, included instructions for creating coconut milk as a substitute for cow’s milk.
    Nut Substitute for Milk. To one-half teacupful of freshly grated cocoanut add one cup of hot water ; stir and press with a spoon to remove as much of the juice as possible, then add a another cup of water and strain through a fine wire strainer or thin cloth, pressing out the liquid and leaving only the dry fibre. (p. 153)
    One of the oldest recorded plant milks, first mentioned in a 13th century Arabic cookbook, almond milk was introduced to Europe approximately a century later, recipes for this milk alternative first appearing in late 14th century cookbooks. An expensive import in medieval Europe, almond milk added an element of luxury to the tables of the upper classes during fasting periods.
    An illustration of weighing and transporting almonds in a market with a green covered ground, men in colorful clothing, camels wearing saddles with storage bags attached, and one light colored dog. In the background are three men, buildings with turrets, a hill, rock formations, and trees. One man wearing short pants, without a shirt or shoes petting a camel next to a tree.
    Weighing and Transport of Almond by Sur Das Wikimedia Commons Public Domain
    The widespread use of almond milk made it an accessible substitute for cow’s milk for Western vegetarians and vegans in the past. Remarkably similar to modern almond milk with the inclusion of sugar and edible gum resin, this 1803 vegetarian cookbook provides instructions for creating an almond paste that can be used to make non-dairy milk.
    But when freed from their skins, or blanched, and reduced to a paste by trituration, with a little loaf sugar or gum arabic, they become sufficiently light and digestible and afford, bulk for bulk, almost as great a quantity of nourishment as any other vegetable substance. In this state of paste, they may, with a small admixture of wheat or other flour, be made into cakes, which will satisfy the appetite and support the body more effectually than twice as much wheaten-bread. The almond paste may also be made into puddings, with ground rice or millet ; or it may be put into soups, which it serves to thicken and render more nutritious. Lastly, the almond paste may be further employed for making a liquor that will in a great measure supply the place of milk. This liquor or emulsion, is easily prepared by triturating the paste with boiling water, which should be added to it little by little (that they may mix together very smoothly) and in such quantity as to give the whole the colour and consistence of new milk. The proportion should be three quarters of an ounce of blanched almonds, with two teaspoonfuls of powdered gum arabic, and three or four lumps of sugar, to a quart of water. The sugar is not absolutely necessary. This will be found to be a very pleasant and wholesome morning and evening beverage, and an excellent substitute for tea. (p. 22–23)
    A photograph of two glass mugs with almond milk placed on a folded pale green cloth. On and next to the cloth are numerous almonds. Everything is placed on a light grain wooden surface.
    Almond Milk by Kjokkenutstyr.net Wikimedia Commons Image License
    Other nut-based milks also appear in several medieval cookbooks, including mentions of dairy alternatives made from walnuts and hazelnuts. Vegetarians and vegans in the Victorian era experimented with other varieties of nuts. The 1899 cookbook Guide to Nut Cookery provided recipes for creating non-dairy milk from different types of nuts.
    HICKORY MILK. Crack the hickory-nuts and pick out the kernels ; grind them through the mill, being careful not to grind them too fine or they will be oily. Then to each heaping cupful of the nut meal add 1 ½ cups of lukewarm water and beat thoroughly, rubbing the mixture against the side of the dish with the back of the spoon. Then line a large bowl with two thicknesses of clean, strong cheese-cloth, pour in the nuts, and squeeze out the milk. (p. 73–74)
    By the early 20th century, cookbooks for vegetarians combined plant based ingredients in even more inventive ways, such as this flaxseed and pine-nut or peanut based buttermilk alternative.
    IMITATION BUTTERMILK. Put into a cup ½ oz. Flaxseed and add 6 oz. Water. Beat it briskly with a rotary eggbeater every ten minutes during one hour. Meanwhile mix and rub together ¾ oz Lemon juice (3 tablespoonfuls) and 1 oz Pignolias or Peanuts flaked very fine once or twice. Let this stand 15 minutes or so ; then add to it the above flaxseed fluid and beat it very briskly with the rotary beater. Now pour it through and serve in a glass with a teaspoon or rye straw. This is cooling in summer and refreshing in winter.
    Non-dairy milk from peanuts, first developed by George Washington Carver was enthusiastically embraced by vegetarians. The 1917 cookbook Vegetarian Diet and Dishes contained a recipe for making peanut milk, which they dubbed “terralac.”
    TERRALAC OR PEANUT-MILK (here first published). — Shell some raw peanuts, and let them soak in cold water for twenty minutes. Then rub off the thin red skins, leaving the kernels white and clean, that is blanched. Let them soak in cold water over night. Then, let them boil slowly in water enough amply to cover them for many hours — at least three hours, and if the fire be weak, several hours longer, until the kernels are soft enough to be thoroughly mashed. Then, using a vegetable masher, pass them through a fine strainer, say a metallic one with 35 meshes to linear inch. Then continue to boil, or simmer, the liquid gently for some hours longer until all trace of a raw taste is lost. The preparation of terralac is much facilitated by very finely comminuting the white kernels of the peanuts with the “Universal Food Chopper.” The straining is then much easier and more rapid and the cooking takes much less time. The milky liquid, if diluted with water to about 3 ½ pints for each quart of unshelled peanuts, or half a pound of blanched kernels, has a close resemblance in chemical composition to cow’s milk, with an equal amount of protein, and just enough excess fat in the peanuts to counterbalance — for calories — the slight excess of the carbohydrates in the milk, and with only about one third as much as in the peanuts as the rather low amount in the milk. A less dilution (say, to three pints, or one quart) would correspond to more concentrated cow’s milk. This peanut milk, or terralac, has an agreeable, somewhat nutty, slightly sweet flavor, and can be used in almost all the ways that are customary with cow’s milk, and is an advantageous substitute for it. (p. 159–160)
    A photograph of a glass bottle of peanut milk, shelled peanuts, and a small part of the peanut plant. Everything is placed on a wooden surface. There is a wall of horizontal wooden boards in the background.
    Peanut Milk by Aquiles THE DOG Wikimedia Commons Image License
    From these above recipes, it is clear that equipment to create finely ground nuts was required as part of the process of creating non-dairy milk. Food mills that could create nut butters were marketed to vegetarians, including in this ad from a 1902 issue of The Vegetarian Magazine. The Vegetarian Society developed their own version of this kitchen gadget, a precursor to food processors or blenders that are often essential in making modern milk alternatives at home.
    A black and white advertisement of THE VEGETARIAN SOCIETY MILL Has been greatly improved and especially adapted for ladies being easily run by children, who are delighted with it, for making Fruit and Nut Butters, Flavoring for Ice Cream, bread Crumbs, whole wheat Graham Flour and other Health Foods. Price, Four Dollars. Pamphlet with fifty recipes free. Address: V.S.A., 1023 Foulkrod Street, Philadelphia (Station F.)
    The Vegetarian Magazine 1902 Google Books Public Domain
    Grains were also used to create milk alternatives. Amazake, dating between 250 and 538 CE is a lightly fermented rice beverage that originated in Japan. Barley water appears in European medieval cookbooks. The numerous varieties of the beverage known as horchata, typically made with rice, sometimes in combination with nuts or seeds, was originally made with barley and has ancient Roman origins.
    While modern oat milk was patented in the 1990’s, oat-based beverages and references to oat milk began to appear at much earlier dates. Recipes for caudle, a spiced, alcoholic hot beverage with origins dating to the medieval period, could be made with oats. Recipes for oat-based caudles continued to appear in 18th century cookbooks. Recipes for barley water and rice water can be found in 19th century vegetarian cookbooks, usually recommended as beverages to serve to someone in poor health.
    An example of a barley water recipe from a vegetarian cookbook can be found in the 1833 edition of Vegetable Cookery.
    1012. Barley Water. Two quarts of water, put two ounces of pearl barley ; when it boils, strain it very clean, then put fresh water to it with a bit of lemon-peel, and let it boil till reduced nearly one-half, then strain it off, and add lemon juice and sugar to the taste. (p. 328)
    The Science of Cooking Vegetarian Food, originally published in 1856, includes a recipe for a beverage called rice water.
    Rice Water.–Wash and pick 2 oz of rice ; set it on the fire in a quart of water ; boil gently till the rice is quite soft and pulpy ; rub it through a sieve, and sweeten with sugar. Lemon-juice may be added. (p. 75)
    A photograph of rice milk in a white cup and white background.
    Rice Milk by User123456789 Wikimedia Commons Public Domain
    Almond milk, along with “barley water” and “oatmeal water” are both classed milk substitutes by a 1903 issue of New England Medical Monthly. Vegetarians and vegans contemporary to this time period may have also considered these grain based beverages viable substitutes for cow’s milk. An 1896 book that advocated for what would today be termed veganism, mentioned oat milk as an alternative to dairy.
    No food should be used which necessitates slaughter. Even animal milk and its products, and eggs, would better be discarded ; and preparations of oat milk, etc., the sap of the South American “cow tree,” nuts, vegetable oils, etc., substituted. (p. 4)
    The Fat of the Land also included a recipe for an oat-based beverage.
    Good for a Hot Day. The thirst that demands drink almost constantly, can be better and more safely quenched by taking two heaping table-spoonfuls of fine oat meal to a quart of water, stir well and set the pitcher in the refrigerator. As it cools and settles the water is slightly colored, and later may resemble milk. (p. 122)
    A photograph of two glass bottles and a glass of oat milk. They are placed on a brown mat and the background is blurred.
    Oat Milk by Shisma Wikimedia Commons Image License
    By the late 19th century, the ingenuity of home-cooks was not the only resource for accessing non-dairy milks. A commercial nut-based product that could be mixed with water to make non-dairy milk, sold under the name Lac Vegetal was described in the vegetarian periodical Good Health in 1897. The Mapleton Nut Food Company sold a variety of nut-derived cream and milk alternatives. Canned soy milk was available to some western vegetarians by the early 20th century, mass production of this milk alternative was taking place in London as described in an article published in a 1913 issue of the Theosophic Messenger.
    VEGETABLE MILK Many vegetarians drink cow’s milk. It is one of the little inconsequences that they would like to avoid–for most of them acknowledge that by taking it they indirectly partake in the slaughtering of old cows and calves. This difficulty is about to be solved. Milk produced from vegetables — chiefly soya beans — will soon be on sale in London cheaper than cow’s milk. A factory with a capacity of forty thousand quarts a day is near completion. The “cowless” product differs little either in taste or appearance from the “natural” product and it is claimed that it is cleaner, keeps longer, and is of unvarying quality. Even can an excellent cheese be made from it. American cities will certainly follow the example, not only for the benefit of conscientious vegetarians, but everybody else as well. (p. 942)
    A black and white advertisement of Bid the Cow Good-bye. Few things are more adulterated or more likely to convey disease germs than dairy produce. Why not try substitutes that are pure and far more wholesome and economical? MAPLETON’S NUT MILK. ½ per lb. Makes 14 pints rich milk equal to new milk, for use in sauces, savouries, bread, cakes, scones, etc. ALMOND CREAM, 1/10 per lb. Makes 14 pints delightful Almond milk for blancmanges, coffee, cocoa, milk puddings, etc., […]
    Herald of the Golden Age (1907) Google Books Public Domain
    The first commercially manufactured non-dairy milks were the cutting edge start of a food revolution, increasing the availability of plant-derived alternatives to animal products.
    The collective centuries-long work of home cooks and food manufacturers across the world contributed to the existence of the plant based milks that stock store shelves and refrigerators in modern grocery stores. Packaged non-dairy milks are not a fleeting trend, but the legacy of the efforts of vegetarians and vegans over a century ago to increase accessibility to plant based foods.
    Thank you for reading!
    If you love history, plants or the history of plants, consider supporting Plant Based Past by buying me a coffee!
    For more vegan, vegetarian, and botanical histories, follow Plant Based Past on Medium.
    You can sign up for email alerts to receive the next story when it becomes available, just by clicking the envelope icon.
    Next Week: 5 Tips from History for Creating a Plastic-Free Plant Based Personal Care Routine`));
}

testMe();


module.exports = {login, grabArticles, writeArticle, polishArticle };