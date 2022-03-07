const fs = require("node:fs");
const Sharp = require("sharp");
const Axios = require("axios");
const Path = require("path");


const FILENAME_REGEX = /[^\/]*\.(png|jpg)/i;

let bgImageDownloaded = {};

async function DownloadBgImage(_url)
{
    // extract filename from url
    let url = new URL(_url);
    let match = url.pathname.match(FILENAME_REGEX);
    let filename = Filename(match[0]);

    // Check to see if we have already downloaded this image
    if (bgImageDownloaded[filename.name]) {
        console.log(`Already downloaded ${filename.name}... skipping`);
        return;
    }

    // this background image has already been downloaded
    bgImageDownloaded[filename.name] = true;

    console.log(`Downloading ${filename.full}`);

    try {
        await DownloadImage(_url, Path.join("./images/icons/bg", filename.full));
        return true;
    }
    catch (ex) {
        console.log(`Error downloading ${filename.full}: ${ex}`);
    }

    return false;
}

async function DownloadFgImage(_url)
{
    // extract filename from url
    let url = new URL(_url);
    let match = url.pathname.match(FILENAME_REGEX);
    let filename = Filename(match[0]);

    console.log(`Downloading ${filename.full}`);

    let full_filename = Path.join("./images/icons/fg", filename.full)

    // Check to see if the file exists
    if (fs.existsSync(full_filename)) {
        console.log("File exists, skipping...");
    }

    try {
        await DownloadImage(_url, full_filename);
        return true;
    }
    catch (ex) {
        console.log(`Error downloading ${filename.full}: ${ex}`);
    }

    return false;
}

async function DownloadImage(src, filepath)
{
    const response = await Axios({
        url: src,
        method: "GET",
        responseType: "stream"
    });

    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on("error", reject)
            .once("close", () => resolve(filepath));
    });
}

// Turns a filename "filename.ext" into an object:
/*
{
    name: "filename",
    ext: "ext",
    full: "filename.ext"
}
*/
function Filename(str)
{
    let s = str.split('.');
    return {
        name: s[0],
        ext: s[1],
        full: str
    }
}

// Main
(async () => {
    let itemsTxt = fs.readFileSync("./data/items.json");
    let itemsData = JSON.parse(itemsTxt);

    // let allItemsTxt = fs.readFileSync("./data/allitemsdata.json");
    // let allItemsData = JSON.parse(allItemsTxt);

    var hasErrored = false;

    for (let item of itemsData) {
        let bgImageUrl = item["bgImage"];
        let fgImageUrl = item["fgImage"];

        // Download background and foreground concurrently, but don't move on to the next set until done
        await Promise.all([
            // Download Background
            DownloadBgImage(bgImageUrl),
            // Download Foreground
            DownloadFgImage(fgImageUrl)
        ])
        .catch(() => hasErrored = true);

        // newline after downloads finished
        console.log();
    }

    if (hasErrored) {
        console.log("There was an error!");
    } else {
        console.log("All images downloaded successfully!");
    }
})();