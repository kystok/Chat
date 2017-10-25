module.exports = function log(type, text, info, ) {


    if (info === undefined)
        info = "no info";
    var result = "  " + type + ": " + text +
        " | " + info + " | " + new Date();
    console.error(result);
}