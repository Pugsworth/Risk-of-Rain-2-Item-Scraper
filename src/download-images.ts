import fs from "node:fs";
import Path from "node:path";
import Sharp from "sharp";
import Axios from "axios";

import { Filename, UrlFilename } from "./Filename";
import { ItemSchema } from "./itemschema";

// Simple string => boolean map to track which background images have already been downloaded
let bgImageDownloaded: { [index:string]: boolean } = {};

async function DownloadBgImage(_url: UrlFilename)
{
    // Check to see if we have already downloaded this image
    if (bgImageDownloaded[_url.filename.name]) {
        console.log(`Already downloaded ${_url.filename.name}, skipping...`);
        return;
    }

    // this background image has already been downloaded
    bgImageDownloaded[_url.filename.name] = true;

    console.log(`Downloading ${_url.filename.filename}`);

    try {
        await DownloadImage(_url.url, Path.join("./images/icons/bg", _url.filename.filename));
        return true;
    }
    catch (ex) {
        console.log(`Error downloading ${_url.filename.filename}: ${ex}`);
    }

    return false;
}

async function DownloadFgImage(_url: UrlFilename)
{
    console.log(`Downloading ${_url.filename.filename}`);

    let full_filename = Path.join("./images/icons/fg", _url.filename.filename)

    // Check to see if the file exists
    if (fs.existsSync(full_filename)) {
        console.log("File exists, skipping...");
    }

    try {
        await DownloadImage(_url.url, full_filename);
        return true;
    }
    catch (ex) {
        console.log(`Error downloading ${_url.filename.filename}: ${ex}`);
    }

    return false;
}

async function DownloadImage(src: string, filepath: string)
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

// Main
(async () => {
    let itemsData = require("../data/allitemsdata.json") as Array<ItemSchema>;

    var hasErrored = false;

    for (let item of itemsData) {
        // Download background and foreground concurrently, but don't move on to the next set until done
        await Promise.all([
            // Download Background
            DownloadBgImage(item.metadata.bgImage),
            // Download Foreground
            DownloadFgImage(item.metadata.fgImage)
        ])
        .catch(() => hasErrored = true);


        // Composite images together and save into the images/icons/all directory
        await CompositeImages(item.metadata.bgImage, item.metadata.fgImage);


        // newline after downloads finished
        console.log();
    }

    if (hasErrored) {
        console.log("There was an error!");
    } else {
        console.log("All images downloaded successfully!");
    }
})();

async function CompositeImages(bgUrlFn: UrlFilename, fgUrlFn: UrlFilename)
{
    // Create the main buffer
    var buffer = Sharp({
        create: {
            width: 128,
            height: 128,
            channels: 3,
            background: { r: 0, g: 0, b: 0 }
        }
    });

    // load and resize background
    var bgBuffer = await Sharp(Path.join("images/icons/bg", bgUrlFn.filename.filename))
        .resize(128, 128)
        .toBuffer();

    // load and resize foreground
    var fgBuffer = await Sharp(Path.join("images/icons/fg", fgUrlFn.filename.filename))
        .resize(128, 128)
        .toBuffer();

    // composite foreground onto background
    buffer
        .composite([
            { input: bgBuffer },
            { input: fgBuffer }
        ])
        .toFile(
            Path.join("images/icons/all", fgUrlFn.filename.filename)
        );
}
