describe("Авторизация", function() {

    let USER = "testEGOR1";
    let USER_SYMB = "[~#&];,:1";

    before((done) => {
        var fn = ln = lg = ps = USER;
    _reg(fn, ln, lg, ps, function(callback) {
        fn = ln = lg = ps = USER_SYMB;
        _reg(fn, ln, lg, ps, function(callback) {
            done();
        });
    });
});

    it("созданного пользователя", function(done) {
        _login(USER, USER, function(callback) {
            try {
                assert.equal(callback.result, true);
                done();
            } catch (e) { done(e) };
        });
    });

    it("символьного пользователя", function(done) {
        _login(USER_SYMB, USER_SYMB, function(callback) {
            try {
                assert.equal(callback.result, true);
                done();
            } catch (e) { done(e) };
        });
    });


    it("не выполнена. Неверный логин/пароль", function(done) {
        _login(USER, USER_SYMB, function(callback) {
            try {
                assert.equal(callback.result, false);
                done();
            } catch (e) { done(e) };
        });
    });

    it("не выполнена. Пустой логин", function(done) {
        _login("", USER, function(callback) {
            try {
                assert.equal(callback.result, false);
                done();
            } catch (e) { done(e) };
        });
    });

    it("не выполнена. Пустой пароль", function(done) {
        _login(USER, "", function(callback) {
            try {
                assert.equal(callback.result, false);
                done();
            } catch (e) { done(e) };
        });
    })

    it("не выполнена. Слишком длинный логин", function(done) {
        _login(USER + USER + USER + USER, USER, function(callback) {
            try {
                assert.equal(callback.result, false);
                done();
            } catch (e) { done(e) };
        });
    });

    it("не выполнена. Слишком длинный пароль", function(done) {
        _login(USER, USER + USER + USER + USER, function(callback) {
            try {
                assert.equal(callback.result, false);
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