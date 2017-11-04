describe("Авторизация", function() {

    let rand = new Date().getMilliseconds(),
        USER = "testEGOR1" + rand,
        USER_SYMB = "[~#&];,:1" + rand;

    before((done) => {
        _reg(USER, USER, USER, USER, function(callback) {
            _reg(USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB, function(callback) {
                done();
            });
        });
    });

    after((done) => {
        _delUsr(USER, function(callback) {
            _delUsr(USER_SYMB, function(callback) {
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

});