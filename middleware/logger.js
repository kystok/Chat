let date = new Date(),
    logDir = '../log/log/',
    jsonDir = '../log/json/',
    chatops = require('./chatops'),
    json_path = jsonDir + date.getFullYear() + '_' + date.getMonth() + '_' + date.getDate() + '.json',
    log_path = logDir + date.getFullYear() + '_' + date.getMonth() + '_' + date.getDate() + '.log';

module.exports = {
    log: log
};

function log(type, info, error) {

    let res = {
        type : type,
        info : info,
        date : date,
        stackTrace : error.stack
    };

    switch (type) {
        case 'WARN':
            console.log(res);
            break;

        case 'ERROR':
            console.log(res);
            chatops.notify(res);
            break;

        case 'CRITICAL ERROR':
            console.log(res);
            chatops.notify(res)
                .then((result) => {
                    process.exit(1)
                });
            break;

        case 'INFO':
            break;

        case 'TRACE':
            break;

        default:
    }
}

process.on('uncaughtException', function(err) {
    console.log(err);
    log('CRITICAL ERROR','uncaughtException',err)
})