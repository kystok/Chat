const express = require('express'),
    router = express.Router(),
    log = require('../routes/login'),
    reg = require('../routes/register');

router.get('/', function (req, res, next) {
    log.f(false);
    reg.f(false);
    res.clearCookie("auth");
    res.clearCookie("username");
    res.redirect('./');
});

module.exports = router;