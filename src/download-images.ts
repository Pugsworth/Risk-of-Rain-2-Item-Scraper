import fs from "node:fs";
import Path from "node:path";
import Sharp from "sharp";
import Axios from "axios";

import { Filename, UrlFilename } from "./Filename";

// Simple string => boolean map to track which background images have already been downloaded
let bgImageDownloaded: { [index:string]: boolean } = {};

async function DownloadBgImage(_url: string)
{
    // extract filename from url
    let urlFn = new UrlFilename(_url);

    // Check to see if we have already downloaded this image
    if (bgImageDownloaded[urlFn.filename.name]) {
        console.log(`Already downloaded ${urlFn.filename.name}, skipping...`);
        return;
    }

    // this background image has already been downloaded
    bgImageDownloaded[urlFn.filename.name] = true;

    console.log(`Downloading ${urlFn.filename.filename}`);

    try {
        await DownloadImage(_url, Path.join("./images/icons/bg", urlFn.filename.filename));
        return true;
    }
    catch (ex) {
        console.log(`Error downloading ${urlFn.filename.filename}: ${ex}`);
    }

    return false;
}

async function DownloadFgImage(_url: string)
{
    // extract filename from url
    let urlFn = new UrlFilename(_url);

    console.log(`Downloading ${urlFn.filename.filename}`);

    let full_filename = Path.join("./images/icons/fg", urlFn.filename.filename)

    // Check to see if the file exists
    if (fs.existsSync(full_filename)) {
        console.log("File exists, skipping...");
    }

    try {
        await DownloadImage(_url, full_filename);
        return true;
    }
    catch (ex) {
        console.log(`Error downloading ${urlFn.filename.filename}: ${ex}`);
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
    let itemsData = require("./data/items.json");

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


        // Composite images together and save into the images/icons/all directory
        let fgUrlFn = new UrlFilename(fgImageUrl);
        let bgUrlFn = new UrlFilename(bgImageUrl);

        await CompositeImages(bgUrlFn, fgUrlFn);


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
