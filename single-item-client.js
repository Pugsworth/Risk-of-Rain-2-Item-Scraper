// This code is ran from within the page via puppeteer
// It has no access to node
function ScrapeSingleItemPage()
{
    function RoRItemData(name, description, rarity, category, stack)
    {
        return {
            name: name,
            description: description,
            rarity: rarity,
            category: category,
            stack: stack
        };
    }

    function trim(str) {
        return str.trim();
    }

    var infoBox = document.querySelector("table.infoboxtable");

    let nameElm = infoBox.querySelector("tr:first-child");
    var name = "MISSING";
    if (nameElm)
        name = nameElm.textContent.trim();

    let descriptionElm = infoBox.querySelector(".infoboxdesc");
    var description = "MISSING";
    if (descriptionElm)
        description = descriptionElm.textContent.trim();

    let rarityElm = infoBox.querySelector("tr:nth-child(5)>td>a");
    var rarity = "MISSING";
    if (rarityElm)
        rarity = rarityElm.textContent.trim();

    let categoryElm = infoBox.querySelector("tr:nth-child(6)>td>a")
    var category = "MISSING";
    if (categoryElm)
        category = categoryElm.textContent.trim();

    let stackabilityElm = infoBox.querySelector("tr:last-child>td:nth-child(3)")
    var stackability = "MISSING";
    if (stackabilityElm)
        stackability = stackabilityElm.textContent.trim();

    let data = RoRItemData(name, description, rarity, category, stackability);

    return data;
}

module.exports = ScrapeSingleItemPage;