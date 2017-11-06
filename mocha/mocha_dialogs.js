describe("Создание диалога", function() {

    let rand = new Date().getMilliseconds(),
        USER = "testEGOR2" + rand,
        USER_SYMB = "[~#&];,:2" + rand,
        users = [USER, USER_SYMB],
        name = "test",
        room1 = room2 = from = null;


    //Регистрация пользователя и подписка на сервере
    before((done) => {
        _reg(USER, USER, USER, USER, function(callback) {
            _reg(USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB, function(callback) {
                _login(USER, USER, function(callback) {
                    from = callback.name;
                    done();
                });
            });
        });
    });

    //Подчищаем тестовую инфу
    after((done) => {
    	_delUsr(USER, function(callback) {
    		_delUsr(USER_SYMB, function(callback) {
    			_delConv(room1, function(callback) {
    				_delConv(room2, function(callback) {
    					done();
    				});
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
});