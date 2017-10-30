const config = require('./config');

var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mysql = require('mysql'),
    _logger = require('morgan'),
    MySQLStore = require('express-mysql-session')(session),
    options = {
        host: config.db.sessions.host,
        port: config.db.sessions.port,
        user: config.db.sessions.user,
        password: config.db.sessions.password,
        database: config.db.sessions.database,
    },
    app = express(),
    routes = require('./routes/main')(app);
const logger = require('./middleware/logger').logger(path.basename(__filename));
const log = require('./middleware/logger').log;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(_logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: config.secret,
    key: 'auth',
    store: new MySQLStore(options)
}));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler  
app.use(function (err, req, res, next) {
    log("INFO", "лезут куда не поподя", {error: err, url: req.url});
    res.redirect('./');
});


module.exports = app;