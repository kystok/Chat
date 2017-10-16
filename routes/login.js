var express = require('express');
var router = express.Router();
var access = require('../middleware/access');
var _auth = false;
var username;
var room=[];

/* GET home page. */
router.get('/', function(req, res, next) {
    if (_auth) {

        if (req.cookies.auth != null || req.cookies.auth != undefined) {} else {
            var cookie = req.session.id;
            req.session.username = username;
        }
        res.render('chat',{room: room, username: username});
    } else {
        res.clearCookie("auth");
        res.render('login');
    }
});

function addRooms(r) {
    room = r;
}


function f(_a, user) {
    _auth = _a;
    username = user;
}


module.exports.f = f
module.exports.router = router;
module.exports.addRooms = addRooms;