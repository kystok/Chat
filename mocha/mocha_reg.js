describe("Регистрация", function() {

    let USER = "testEGOR";
    let USER_SYMB = "[~#&];,:";

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
        } catch (e) { done(e) };
        });
    });

    it("пустого пользователя", function(done) {
        var fn = ln = lg = ps = '';
        _reg(fn, ln, lg, ps, function(callback) {
            try {
                assert.equal(callback.registration, false);
            done();
        } catch (e) { done(e) };
        });
    });
    it("undefined", function(done) {
        var fn = ln = lg = ps;
        _reg(fn, ln, lg, ps, function(callback) {
            try {
                assert.equal(callback.registration, false);
            done();
        } catch (e) { done(e) };
        });
    });
    it("длинного пользователя", function(done) {
        var fn = ln = lg = ps = '                                                                               ';
        _reg(fn, ln, lg, ps, function(callback) {
            try {
                assert.equal(callback.registration, false);
            done();
        } catch (e) { done(e) };
        });
    });

    it("спецсимвольного пользователя", function(done) {
        var fn = ln = lg = ps = USER_SYMB;
        _reg(fn, ln, lg, ps, function(callback) {
            try {
                assert.equal(callback.registration, true, callback.info);
            done();
        } catch (e) { done(e) };
        });
    });

    describe("Очистка", function() {

        it("тестового пользователя", function(done) {
            _delUsr(USER, function(callback) {
                try {
                    assert.equal(callback, true, callback.info);
                done();
            } catch (e) { done(e) };
            });
        });

        it("спецсимвольного пользователя", function(done) {
            _delUsr(USER_SYMB, function(callback) {
                try {
                    assert.equal(callback, true, callback.info);
                done();
            } catch (e) { done(e) };
            });
        });
    });
});