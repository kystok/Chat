let express = require('express'),
    router = express.Router(),
    _auth = false,
    room = [],
    path = require('path'),
    log = require('../middleware/logger').log,
    username;

router.get('/', function(req, res, next) {
    //log("TRACE", "начальное", );
    console.log("1234");
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