describe("Создание диалога", function() {

    let USER = "testEGOR2",
        USER_SYMB = "[~#&];,:2";
    users = [USER, USER_SYMB],
        name = "test",
        room1 = room2 = from = null;

    var from, room1,
        room2;
    before((done) => {
        var fn = ln = lg = ps = USER;
    _reg(fn, ln, lg, ps, function(callback) {
        fn = ln = lg = ps = USER_SYMB;
        _reg(fn, ln, lg, ps, function(callback) {
            _login(USER, USER, function(callback) {
                from = callback.name;
                done();
            });
        });
    });
});


    it("с самим собой", function(done) {
        _addConversation(USER, name, from, function(result) {
            room1 = result.id;
            try {
                assert.notEqual(result.result, false);
                done();
            } catch (e) { done(e) };
        });
    });

    it("с двумя пользователями", function(done) {
        _addConversation(users, name, from, function(result) {
            room2 = result.id;
            try {
                assert.notEqual(result.result, false);
                done();
            } catch (e) { done(e) };
        });
    });

    it("с пустым названием", function(done) {
        _addConversation(USER, "", from, function(result) {
            try {
                assert.equal(result.result, false);
                done();
            } catch (e) { done(e) };
        });
    });

    it("без собеседников", function(done) {
        _addConversation("", name, from, function(result) {
            try {
                assert.equal(result.result, false);
                done();
            } catch (e) { done(e) };
        });
    });

    it("undefined", function(done) {
        _addConversation(undefined, undefined, from, function(result) {
            try {
                assert.equal(result.result, false);
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

        it("тестового диалога #1", function(done) {
            _delConv(room1, function(callback) {
                try {
                    assert.equal(callback, true, callback.info);
                    done();
                } catch (e) { done(e) };
            });
        });

        it("тестового диалога #2", function(done) {
            _delConv(room2, function(callback) {
                try {
                    assert.equal(callback, true, callback.info);
                    done();
                } catch (e) { done(e) };
            });
        });
    });
});