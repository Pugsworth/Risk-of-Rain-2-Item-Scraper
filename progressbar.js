const EPISILON = 0.01;

function ProgressBar(prefix, frac, charToUse, totalColumns, showPercent = false)
{
    var cols = Math.floor(totalColumns * frac);
    let remainingCols = totalColumns - cols;
    if ((1.0 - frac) <= EPISILON) { // Special case to handle really close fractions and float precision
        cols = totalColumns;
        remainingCols = 0;
    }

    let bar = String.prototype.repeat.call(charToUse, cols);
    let empty = String.prototype.repeat.call('.', remainingCols)
    var extra = "";

    if (showPercent) {
        extra = `(${(frac * 100.0).toFixed(2)})`;
    }

    return `${prefix} [${bar}${empty}]${extra}`;
}



module.exports = ProgressBar;