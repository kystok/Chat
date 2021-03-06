const HOST = require('../config.json').server;
let app = require('../app'),
    https = require('https'),
    fs = require('fs'),
    options = {
        key: fs.readFileSync('./privkey.pem'),
        cert: fs.readFileSync('./fullchain.pem')
    };

let httpServer = app.listen(HOST.port);
let SSLserver = https.createServer(options,app).listen(HOST.SSLport);

require('../middleware/WSS')(httpServer, SSLserver);


