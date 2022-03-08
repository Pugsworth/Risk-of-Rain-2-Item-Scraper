/*
Take a url and turn it into an object like:
{
    url -> String,
    filename -> Filename
}
Purpose: Prepare a url for download and file manipulation
*/
const FILENAME_REGEX = /[^\/]*\.(png|jpg)/i;

class UrlFilename
{
    url = "";
    filename = "";

    constructor(_urlStr)
    {
        let url = new URL(_urlStr);
        let match = url.pathname.match(FILENAME_REGEX);

        let extracted_filename = match[0];

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
class Filename
{
    name = "";
    ext = "";
    filename = "";

    // _fn = filename = "filename.ext"
    constructor(_fn)
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

exports.UrlFilename = UrlFilename;
exports.Filename = Filename;
