/*
Take a url and turn it into an object like:
{
    url -> String,
    filename -> Filename
}
Purpose: Prepare a url for download and file manipulation
*/
const FILENAME_REGEX = /[^\/]*\.(png|jpg)/i;

export class UrlFilename
{
    url: string;
    filename: Filename;

    constructor(_urlStr: string)
    {
        let url = new URL(_urlStr);
        let match = url.pathname.match(FILENAME_REGEX);

        if (match == null) {
            // TODO: Do something about the null match
            throw "Match is null";
        }

        let extracted_filename = match![0];

        this.url = _urlStr;
        this.filename = new Filename(extracted_filename);
    }
}

// Turns a filename "filename.ext" into an object:
/*
{
    name: "filename",
    ext: "ext",
    full: "filename.ext"
}
Purpose: Turn a filename into the components
*/
export class Filename
{
    name: string;
    ext: string;
    filename: string;

    // _fn = filename = "filename.ext"
    constructor(_fn: string)
    {
        let s = _fn.split('.');

        this.name = s[0];
        this.ext = s[1];
        this.filename = _fn;
    }

    toString()
    {
        return this.filename;
    }
}