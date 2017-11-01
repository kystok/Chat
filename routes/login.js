var express = require('express');
var router = express.Router();
var path = require('path');
const logger = require('../middleware/logger').logger(path.basename(__filename));
const log = require('../middleware/logger').log;
var _auth = false;
var db = require('../middleware/dbWare');
var username;
var room = [];
var sessions = [];


router.get('/', function(req, res, next) {
    console.log("111");
    if (_auth) {
        if (username)
            db.addAccess(username, req.session.id)
            .then(result => {
                res.render('chat', { room: room, username: username });
                _auth = false;
            })
            .catch(error => { _auth = false; })
            else
            {
                _auth = false;
                res.render('login');
            }

    } else {
        console.log("111111111",req.session);
        db.access(req.session.id)
            .then(result => {
                if (result[0].user) {
                    req.session.username = result[0].user;
                    res.render('chat', { room: room, username: result[0].user });
                } else {
                    _auth = false;
                    res.render('login');
                }
            })
            .catch(error => {
                _auth = false;
                res.render('login');
            });
    }
});


function addRooms(r) {
    room = r;
}


function f(_a, user) {
    _auth = _a;
    if (_a) {
        username = user;
    }
}



module.exports.f = f
module.exports.router = router;
module.exports.addRooms = addRooms;