var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');
var MySQLStore = require('express-mysql-session')(session);
const config = require('./config');
var options = {
    host: config.db.sessions.host,
    port: config.db.sessions.port,
    user: config.db.sessions.user,
    password: config.db.sessions.password,
    database: config.db.sessions.database,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(logger('dev'));     //Логер запросов

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: config.secret,
    key: 'auth',
    store: new MySQLStore(options)
}));
var routes = require('./routes/main')(app);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    /*   res.locals.message = err.message;
       res.locals.error = req.app.get('env') === 'development' ? err : {};

       // render the error page
       res.status(err.status || 500);
       res.render('error');*/
});

module.exports = app;