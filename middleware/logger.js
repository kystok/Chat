let path;
const fs = require('fs'),
    logDir = '../log/log/',
    jsonDir = '../log/json/';


function log(type, text, info) {

    let t = new Date();
    if (info === undefined)
        info = "no info";
    let res = {};
    switch (type) {
        case 'WARN':
            res.WARN = {
                from: path,
                text,
                info: info,
                date: t
            };
            break;
        case 'ERROR':
            res.ERROR = {
                from: path,
                text,
                info: info,
                date: t
            };
            break;
        case 'DBcore':
            res.INFO = {
                from: path,
                text,
                info: info,
                date: t
            };
            break;
        case 'INFO':
            res.INFO = {
                from: path,
                text,
                info: info,
                date: t
            };
            break;
        case 'TRACE':
            res.TRACE = {
                from: path,
                text,
                info: info,
                date: t
            };
            break;
        default:
            // statements_def
            break;
    }

    let json_path = jsonDir + t.getFullYear() + '_' + t.getMonth() + '_' + t.getDate() + '.json',
        log_path = logDir + t.getFullYear() + '_' + t.getMonth() + '_' + t.getDate() + '.log';

    if (type) {
        console.log("------------");
        console.log(res);
        console.log("------------");

        // writeLog(res, log_path);
        // writeLog(res, json_path);
    }
}

function logger(_path) {
    path = _path;
}


module.exports = {
    log: log,
    logger: logger
};


function writeLog(text, path) {
    let te = [];
    fs.appendFile(path, "", (err) => {
        try {
            let t1 = fs.readFile(path, 'utf-8',
                (error, data) => {
                    if (error) return "error";
                    if (data) {
                        try {
                            te = JSON.parse(data);
                        } catch (e) {
                        }
                    }
                    te.push(text);
                    fs.writeFile(path, JSON.stringify(te), function (err) {
                    });
                    return data;
                });
        } catch (e) {
        }
    });
}
