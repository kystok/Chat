var path;
const fs = require('fs');
const logDir = '../log/log/';
const jsonDir = '../log/json/';


function log(type, text, info) {

    var t = new Date();
    if (info === undefined)
        info = "no info";
    var res = {};
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

    var json_path = jsonDir + t.getFullYear() + '_' + t.getMonth() + '_' + t.getDate() + '.json';
    var log_path = logDir + t.getFullYear() + '_' + t.getMonth() + '_' + t.getDate() + '.log';

    if (type) {
	console.log("------------");
	console.log(res);
	console.log("------------");

       // writeLog(res, log_path);
       // writeLog(res, json_path);
    }


    ;
}

function logger(_path) {
    path = _path;
}


module.exports = {
    log: log,
    logger: logger
};


function writeLog(text, path) {
    var te = new Array();
    fs.appendFile(path, "", function (err) {
        try {
            var t1 = fs.readFile(path, 'utf-8',
                function (error, data) {
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

    /* fs.appendFile(log_path, "", function (err) {
         try {
             var t1 = fs.readFile(log_path, 'UTF-8',
                 function (error, data) {
                     if (error) return "error";
                     if (data) {
                         te = JSON.parse(data);
                         console.log('te', te.length)
                     }
                     te.push(text)
                     fs.writeFile(log_path, JSON.stringify(te), function (err) {
                     });
                     return data;
                 });
         } catch (e) {
             console.log('eeerrr ', e);
         }
     });*/

}
