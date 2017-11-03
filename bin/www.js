<<<<<<< HEAD
var app = require('../app'),
    debug = require('debug')('www2:server'),
    https = require('https'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    logger = require('../middleware/logger').logger(path.basename(__filename)),
    log = require('../middleware/logger').log;
    
const host = require('../config.json').server,
=======
const
    debug = require('debug')('www2:server'),
    app = require('../app'),
    path = require('path'),
    logger = require('../middleware/logger').logger(path.basename(__filename)),
    log = require('../middleware/logger').log,
    host = require('../config.json').server,
    http = require('http'),
    https = require('https'),
    port = normalizePort(process.env.PORT || host.port),
    httpServer = app.listen(port),
    fs = require('fs'),
    _host = require('../config.json').server,
>>>>>>> orlov
    options = {
        key: fs.readFileSync('./privkey.pem'),
        cert: fs.readFileSync('./fullchain.pem')
    };
<<<<<<< HEAD

var port = normalizePort(process.env.PORT || host.port),
    SSLport = normalizePort(host.SSLport);
 
var httpServer = app.listen(port),
    SSLserver = https.createServer(options,app);
=======
let    SSLport = normalizePort(host.SSLport),
    SSLserver = https.createServer(options,app);

httpServer.listen(port);
SSLserver.listen(SSLport);
>>>>>>> orlov

require('../middleware/socketServer')(httpServer, SSLserver);

<<<<<<< HEAD
httpServer.listen(port);
SSLserver.listen(SSLport);

require('../middleware/dbWare');
=======
require('../middleware/socketServer')(httpServer, SSLserver);
require('../middleware/dbWare');

>>>>>>> orlov


function normalizePort(val) {
    let port = parseInt(val, 10);

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

    let bind = typeof port === 'string' ?
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
    const addr = httpServer.address(),
        bind = typeof addr === 'string' ?
            'pipe ' + addr :
            'port ' + addr.port;
    debug('Listening on ' + bind);
}
