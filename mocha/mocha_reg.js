describe("Регистрация", function() {

    let rand = new Date().getMilliseconds(),
        USER = "testEGOR" + rand,
        USER_SYMB = "[~#&];,:" + rand;

    //чистим тестовые логины
    after((done) => {
        _delUsr(USER, function(callback) {
            _delUsr(USER_SYMB, function(callback) {
                done();
            });
        });
    });  


    it("нового пользователя", function(done) {
        var fn = ln = lg = ps = USER;
        _reg(fn, ln, lg, ps, function(callback) {
            try {
                assert.equal(callback.registration, true);
                done();
            } catch (e) { done(e) };
        });
    });

    it("существующего пользователя", function(done) {
        var fn = ln = lg = ps = USER;
        _reg(fn, ln, lg, ps, function(callback) {
            try {
                assert.equal(callback.registration, false);
                done();
            } catch (e) {
                done(e)
            };
        });
    });

    it("пустого пользователя", function(done) {
        var fn = ln = lg = ps = '';
        _reg(fn, ln, lg, ps, function(callback) {
            try {
                assert.equal(callback.registration, false);
                done();
            } catch (e) {
                done(e)
            };
        });
    });
    it("undefined", function(done) {
        var fn = ln = lg = ps;
        _reg(fn, ln, lg, ps, function(callback) {
            try {
                assert.equal(callback.registration, false);
                done();
            } catch (e) {
                done(e)
            };
        });
    });
    it("длинного пользователя", function(done) {
        var fn = ln = lg = ps = '                                                                               ';
        _reg(fn, ln, lg, ps, function(callback) {
            try {
                assert.equal(callback.registration, false);
                done();
            } catch (e) {
                done(e)
            };
        });
    });

    it("спецсимвольного пользователя", function(done) {
        var fn = ln = lg = ps = USER_SYMB;
        _reg(fn, ln, lg, ps, function(callback) {
            try {
                assert.equal(callback.registration, true, callback.info);
                done();
            } catch (e) {
                done(e)
            };
        });
    });



});