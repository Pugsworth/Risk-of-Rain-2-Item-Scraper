// This code is ran from within the page via puppeteer
// It has no access to node
function ScrapeAllItemsPage()
{
    var itemsList = []
    var skippedItems = [] // Items skipped due to errors

    var itemTable = document.querySelector("#content .mw-parser-output table>tbody")

    var tds = itemTable.querySelectorAll("td");
    for (let td of tds) {
        function fixupWikiPage(url)
        {
            // Real quick and dirty method to extract what we need out of the url
            let reg =/(.*)(?=\/scale)/g;
            let matches = url.match(reg);
            console.log("url: ", url)
            console.log("Matches: ", matches);
            if (matches === null) {
                throw "Image URL is invalid!!";
            }
            return matches[0];
        }

        function getImageSrc(element)
        {
            let dataSrc = element.getAttribute("data-src");
            let src = element.getAttribute("src");
            let img = src;
            if (dataSrc !== null) {
                img = dataSrc;
            }
            return img;
        }

        let title = td.querySelector("span > a").title;
        let wikiPage = td.querySelector("span > a").href

        let bgImage = (() => {
            let urlElm = td.querySelector("span > a > img");
            // console.log("bgImage urlElm: ", urlElm.outerHTML);
            let img = getImageSrc(urlElm);
            return fixupWikiPage(img);
        })();

        let fgImage = (() => {
            let urlElm = td.querySelector("span > span img");
            // console.log("fgImage urlElm: ", urlElm.outerHTML);
            let img = getImageSrc(urlElm);
            return fixupWikiPage(img);
        })();

        let item = new RoRItem(title, wikiPage, bgImage, fgImage);

        itemsList.push(item);
    }

    function RoRItem(title, wikiPage, bgImage, fgImage)
    {
        return {
            title: title,
            wikiPage: wikiPage,
            bgImage: bgImage,
            fgImage: fgImage
        };
    }

    return itemsList;
}

module.exports = ScrapeAllItemsPage;