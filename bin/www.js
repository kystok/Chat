var app = require('../app');
var debug = require('debug')('www2:server');
var http = require('http');
var path = require('path');
const logger = require('../middleware/logger').logger(path.basename(__filename));
const log = require('../middleware/logger').log;
const host = require('../config.json').server;

var port = normalizePort(process.env.PORT || host.port);

var server = app.listen(port);
var ss = require('../middleware/socketServer')(server);
require('../middleware/dbWare');



server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


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