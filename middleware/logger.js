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
    info = (typeof(info)==="object") ? JSON.stringify(info) : info;

    let res = {
        type : type,
        error : text,
        date : date,
        StackTrace : info
    };

    switch (type) {
        case 'WARN':
            chatops.notify(res)
            break;

        case 'ERROR':
            chatops.notify(res).then(result => {process.exit(1)})
            break;

        case 'INFO':
            break;

        case 'TRACE':
            break;

        default:
    }
}

process.on('uncaughtException', function(err) {
    log('ERROR','uncaughtException',err)
})