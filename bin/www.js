const HOST = require('../config.json').server,
    app = require('../app'),
    https = require('https'),
    fs = require('fs'),
    options = {
        key: fs.readFileSync('./privkey.pem'),
        cert: fs.readFileSync('./fullchain.pem')
    },
    httpServer = app.listen(HOST.port),
    SSLserver = https.createServer(options, app).listen(HOST.SSLport);

require('../middleware/WSS')(httpServer, SSLserver);


