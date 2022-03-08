// const puppet = require("puppeteer");
// const fs = require("node:fs");

import fs from "node:fs";
import puppet from "puppeteer";
import { Queue } from "queue-typescript";
import { UrlFilename } from "./Filename";
import { ItemData, ItemSchema } from "./itemschema";
import ProgressBar from "./progressbar";

import ScrapeAllItemsPage from "./puppeteer/items-client";
import ScrapeSingleItemPage from "./puppeteer/single-item-client";


interface RoRItem {
    title: string,
    wikiPage: string,
    bgImage: string,
    fgImage: string
};

(async () => {
    const { page, browser } = await BuildBrowser();
    await page.goto("https://riskofrain2.fandom.com/wiki/Items", { timeout: 0 });

    // await page.goto("file:///C:/Users/Kyle/Desktop/Projects/nodejs/RiskofRain2-Item-Webpage/src/utility/items-scraper/cached-pages/Items - Risk of Rain 2 Wiki.html");

    await page.waitForSelector("#content .mw-parser-output");
    // Scroll down so the images load
    await page.evaluate(() => {
        document.querySelector("#content .mw-parser-output table>tbody td:last-child")!
            .scrollIntoView({ behavior: "smooth", block: "end", inline: "end" });
    });
    // Grab data and return JSON object
    var itemsList = await page.evaluate(ScrapeAllItemsPage) as Array<RoRItem>;

    // Save this list for later
    var data: any = JSON.stringify(itemsList, null, '\t');
    fs.writeFileSync("./data/items.json", data);

    var allData = new Array<ItemSchema>();
    var queue = new Queue<RoRItem>();
    let totalCount = itemsList.length;

    // Push all of the preliminary items on to the queue
    for (let item of itemsList) {
        queue.enqueue(item as RoRItem);
    }

    var i = 0;
    var processed = 0;

    console.log(`Queue size: ${queue.length}`);

    // Iterate the entire queue until it is complete, adding failed back onto the queue.
    while (queue.length > 0)
    {
        // Since this is a queue, we want to run through the entire list before retrying any items.
        let item = queue.dequeue();

        i += 1;

        // Log the name for tracking purposes...
        console.log(`Attempting to pull data from "${item.title}".`);

        await page.goto(item.wikiPage);
        try {
            var itemdata = await page.evaluate(ScrapeSingleItemPage) as ItemData;
            await page.waitForSelector(".infoboxtable");

            // console.log(`[${i}]${data.name} data:`, JSON.stringify(data, null, '\t'));

            // Construct the full ItemScheme
            let itemSchema: ItemSchema = {
                name: item.title,
                metadata: {
                    wikiPage: new URL(item.wikiPage),
                    bgImage: new UrlFilename(item.bgImage),
                    fgImage: new UrlFilename(item.fgImage)
                },
                data: {
                    description: itemdata.description,
                    rarity: itemdata.rarity,
                    category: itemdata.category,
                    stackability: itemdata.stackability
                }
            };

            allData.push(itemSchema);

            processed += 1;
        }
        catch(ex) {
            console.log("Failed!!!");
            console.log(ex);
            queue.enqueue(item);
        }

        // Progress bar!
        var frac = processed / totalCount;
        console.log( ProgressBar("Progress:", frac, '#', 40, true) );

        // Wait between pages to slow down traffic
        await page.waitForTimeout(1000);
    }

    // TODO: Catch errors and write partial data,
        // When attempting to run again, compare scraped item title against allitemsdata and skip if it exists
    fs.writeFileSync("./data/allitemsdata.json", JSON.stringify(allData, null, '\t'));

    await browser.close();
})();

async function BuildBrowser()
{
    const browser = await puppet.launch({
        headless: true,
        devtools: false
    });
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    // Don't load pointless javascript
    page.on("request", request =>
    {
        if (request.resourceType() == "script") {
            request.abort();
        } else {
            request.continue();
        }
    });

    // console redirection
    page.on("console", message =>
    {
        return;
        if (/error|log/.test(message.type())) { // message.type() in [list of value]
            console.log("[Puppeteer] " + message.text());
        }
    });

    return { page, browser };
}

