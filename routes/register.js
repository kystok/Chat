var express = require('express');
var router = express.Router();
var _auth = false;
var room = [];
var username;

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log('_auth ',_auth);
    if (_auth) {

        if (req.cookies.auth != null || req.cookies.auth != undefined) {} else {
            var cookie = req.session.id;
            req.session.username = username;
        }
        console.log(_auth);
        res.redirect('./');
        res.render('chat', { room: room, username: username});
    } else {
        res.clearCookie("auth");
        res.render('register');
    }
});

function f(_a, user) {
    _auth = _a;
    console.log(_auth);
    username = user;
}

function addRooms(r) {
    room = r;
}

module.exports.router = router;
module.exports.f = f;
module.exports.addRooms = addRooms;