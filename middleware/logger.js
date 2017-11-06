let date = new Date(),
    logDir = '../log/log/',
    jsonDir = '../log/json/',
    chatops = require('./chatops'),
    json_path = jsonDir + date.getFullYear() + '_' + date.getMonth() + '_' + date.getDate() + '.json',
    log_path = logDir + date.getFullYear() + '_' + date.getMonth() + '_' + date.getDate() + '.log';

module.exports = {
    log: log,
    logger: logger
};

function log(type, text, info) {
    let res = {
        type : type,
        error : text,
        date : date,
        StackTrace : info
    };

    switch (type) {
        case 'WARN':
            break;

        case 'ERROR':
            break;

        case 'INFO':
            break;

        case 'TRACE':
            break;

        default:
            // statements_def
    };

    chatops.notify(res);
}

function logger(_path) {
    path = _path;
}