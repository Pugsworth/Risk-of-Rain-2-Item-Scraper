// Item Schema after data is scraped
// The Items Schema should be:
/*
[
    {
        "name": "String",
        "metadata": {
            "wikiPage": "String | url to the wiki page"
            "bgImage": {
                "url": "String | url to the background image",
                "filename": {
                    "basename": "String | filename without extension and no path",
                    "ext": "String | image extension"
                }
            },
            "fgImage": {
                "url": "String | url to the background image",
                "filename": {
                    "basename": "String | filename without extension and no path",
                    "ext": "String | image extension"
                }
            }
        },
        "data": {
            "description": "String | Item's description",
            "rarity": "String | Item's rarity",
            "category": "String | Item's category",
            "stackability": "String | Item's stacking type (linear, hyperbolic, etc)"
        }
    },
    ...
]
*/

import { Filename, UrlFilename } from "./Filename"

export interface ItemMetadata {
    wikiPage: URL,
    bgImage: UrlFilename,
    fgImage: UrlFilename
};

export interface ItemData {
    description: string,
    rarity: string,
    category: string,
    stackability: string
};

export interface ItemSchema {
    name: string,
    metadata: ItemMetadata,
    data: ItemData
}