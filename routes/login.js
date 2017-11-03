const path = require('path'),
    express = require('express'),
    logger = require('../middleware/logger').logger(path.basename(__filename)),
    db = require('../middleware/dbWare'),
    log = require('../middleware/logger').log,
    router = express.Router();
let username,
_auth = false,
    room = [],
    sessions = [];

router.get('/', (req, res, next) => {
    if (_auth) {
        if (username)
            db.addAccess(username, req.session.id)
                .then(result => {
                    res.render('chat', {room: room, username: username});
                    _auth = false;
                })
                .catch(error => {
                    _auth = false;
                });
        else {
            _auth = false;
            res.render('login');
        }

    } else {
        db.access(req.session.id)
            .then(result => {
                if (result[0].user) {
                    req.session.username = result[0].user;
                    res.render('chat', {room: room, username: result[0].user});
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


module.exports.f = f;
module.exports.router = router;
module.exports.addRooms = addRooms;
