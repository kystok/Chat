var app = require('../app'),
    debug = require('debug')('www2:server'),
    https = require('https'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    logger = require('../middleware/logger').logger(path.basename(__filename)),
    log = require('../middleware/logger').log;
    
const host = require('../config.json').server;
    options = {
        key: fs.readFileSync('./privkey.pem'),
        cert: fs.readFileSync('./fullchain.pem')
    };

var port = normalizePort(process.env.PORT || host.port);
    SSLport = normalizePort(host.SSLport);
 
var httpServer = app.listen(port);
    SSLserver = https.createServer(options,app);

require('../middleware/socketServer')(httpServer, SSLserver);

httpServer.listen(port);
SSLserver.listen(SSLport);

require('../middleware/dbWare');


function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
        log("ERROR", "ошибка", error);
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    debug('Listening on ' + bind);
}