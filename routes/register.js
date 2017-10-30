var express = require('express');
var router = express.Router();
var _auth = false;
var room = [];
var path = require('path');
const logger = require('../middleware/logger').logger(path.basename(__filename));
const log = require('../middleware/logger').log;
var username;

router.get('/', function(req, res, next) {
    //log("TRACE", "начальное", );
    if (_auth) {
        if (req.cookies.auth != null || req.cookies.auth != undefined) {} else {
            var cookie = req.session.id;
            req.session.username = username;
        }
        res.redirect('/');
    } else {
        res.clearCookie("auth");
        log("TRACE", "не вошли", _auth)
        res.render('register');
    }
});

function f(_a, user) {
    _auth = _a;
    username = user;
}

module.exports.router = router;
module.exports.f = f;