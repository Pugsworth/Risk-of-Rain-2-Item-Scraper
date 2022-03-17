# Risk-of-Rain-2-Item-Scraper

## About
This repo contains a couple of nodejs files to scrape data and download images from the Risk of Rain 2 fandom wiki page.

Item information is scraped from the table on this page:
https://riskofrain2.fandom.com/wiki/Items
Information gathered from this table is:
- background and foreground images
- item name
- [wiki page url]

Then, it visits each [wiki page url] and fetches the remaining information for the item such as:
- description
- rarity
- category
- stacking type

## Getting-Started
1) run npm install to install all the packages required
2) build with ```npm run build```
3) scrape data with ```npm run scrape-data```
4) download images with ```npm run download-images```
5) copy ./data/allitemsdata.json to location
6) copy ./images/icons/all/* to location

## Warnings
- This code is not robust at all. It works right now and that's all I needed.
- Currently, the images are saved using encodeURIComponent on the filename. This is working just fine right now, but it could break later.

