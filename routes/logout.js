var express = require('express');
var router = express.Router();
const log = require('../routes/login');
const reg = require('../routes/register');

router.get('/', function(req, res, next) {
    log.f(false);
    reg.f(false);
    res.clearCookie("auth");   
    res.clearCookie("username")
    res.redirect('/');
});

module.exports = router;