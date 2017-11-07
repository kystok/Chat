const config = require('./config'),
    express = require('express'),
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
    log = require('./middleware/logger').log;


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(_logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: config.secret,
    key: 'auth',
    store: new MySQLStore(options)
}));
const routes = require('./routes/main')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    log("INFO", "лезут куда не поподя", req.url);
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
