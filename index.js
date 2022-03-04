const puppet = require("puppeteer");
const fs = require("node:fs");

const ScrapeAllItemsPage = require("./items-client");
const ScrapeSingleItemPage = require("./single-item-client");
const ProgressBar = require("./progressbar");

(async () => {
    const browser = await puppet.launch({
        headless: true,
        devtools: false
    });
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    // Don't load pointless javascript
    page.on("request", request => {
        if (request.resourceType() == "script") {
            request.abort();
        } else {
            request.continue();
        }
    });
    // console redirection
    page.on("console", message => {
        return;
        if (/error|log/.test(message.type())) { // message.type() in [list of value]
            console.log("[Puppeteer] " + message.text());
        }
    });
    await page.goto("https://riskofrain2.fandom.com/wiki/Items", { timeout: 0 });
    // await page.screenshot({ path: "./images/screenshots/test.png" })

    // await page.goto("file:///C:/Users/Kyle/Desktop/Projects/nodejs/RiskofRain2-Item-Webpage/src/utility/items-scraper/cached-pages/Items - Risk of Rain 2 Wiki.html");

    await page.waitForSelector("#content .mw-parser-output");
    // Scroll down so the images load
    await page.evaluate(() => {
        document.querySelector("#content .mw-parser-output table>tbody td:last-child")
            .scrollIntoView({ behavior: "smooth", block: "end", inline: "end" });
    });
    // Grab data and return JSON object
    var itemsList = await page.evaluate(ScrapeAllItemsPage);

    // Save this list for later
    var data = JSON.stringify(itemsList);
    fs.writeFileSync("./data/items.json", data);

    var allData = [];
    var queue = [];
    let totalCount = itemsList.length;

    // Push all of the preliminary items on to the queue
    for (let item of itemsList) {
        queue.push(item);
    }

    var i = 0;
    var processed = 0;

    console.log(`Queue size: ${queue.length}`);

    // Iterate the entire queue until it is complete, adding failed back onto the queue.
    while (queue.length > 0)
    {
        // Since this is a queue, we want to run through the entire list before retrying any items.
        // TODO: Does this incur a significant performance penalty? Look into using a linked list
        let item = queue.shift();

        i += 1;

        // Log the name for tracking purposes...
        console.log(`Attempting to pull data from "${item.title}".`);

        await page.goto(item.wikiPage);
        try {
            var data = await page.evaluate(ScrapeSingleItemPage);
            await page.waitForSelector(".infoboxtable");

            // console.log(`[${i}]${data.name} data:`, JSON.stringify(data, null, '\t'));

            allData.push(data);

            processed += 1;
        }
        catch(ex) {
            console.log("Failed!!!");
            console.log(ex);
            queue.push(item);
        }

        // Progress bar!
        var frac = processed / totalCount;
        let progress = ProgressBar("Progress:", frac, '#', 40, true);
        console.log(progress);

        // Wait between pages to slow down traffic
        await page.waitForTimeout(1000);
    }

    fs.writeFileSync("./data/allitemsdata.json", JSON.stringify(allData));


    // Now go through each item and load the web page while scraping each one
    // TODO: console.log a progress bar

    await browser.close();
})();
