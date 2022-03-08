const { UrlFilename, Filename} = require("../Filename");


const assert = require("assert");

describe("file filename.js", () => {
    describe("class UrlFilename", () => {
        it("should give the correct results", () => {
            let _url = "https://static.wikia.nocookie.net/riskofrain2_gamepedia_en/images/8/8b/Her_Biting_Embrace.png/revision/latest";
            let result = new UrlFilename(_url);
            assert.equal(result.url, _url);
            assert.equal(result.filename.name, "Her_Biting_Embrace");
            assert.equal(result.filename.ext, "png");
            assert.equal(result.filename.filename, "Her_Biting_Embrace.png");
        })
    })

    describe("class Filename", () => {
        it("should give the correct results", () => {
            let _fn = "test.png";
            let result = new Filename(_fn);
            assert.equal(result.name, "test");
            assert.equal(result.ext, "png");
            assert.equal(result.filename, _fn);
        })
    })
})