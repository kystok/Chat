
const USER = "testEGOR";
const USER_SYMB = "[~#&];,:";


describe("WS connection", function() {

  it("Подключение к серверу", function(done) {
    assert.equal(connect(), true);
    done();
  });

});


describe("Подготовка к тестированию", function() {

        it("очистка БД", function (done) {
            _delUsr(USER, function (callback) {
                _delUsr(USER_SYMB, function (callback) {
                    assert.equal(callback, true, callback.info);
                    done();
                });
            });
        });
});

describe("Регистрация", function() {

    it("нового пользователя", function(done) {
        var fn = ln = lg = ps = USER;
        _reg(fn, ln, lg, ps, function (callback) {
            assert.equal(callback.registration, true);
            done();
        });
    });
    
    it("существующего пользователя", function (done) {
        var fn = ln = lg = ps = USER;
        _reg(fn, ln, lg, ps, function (callback) {
            assert.equal(callback.registration, false);
            done();
        });
    });

    it("пустого пользователя", function (done) {
        var fn = ln = lg = ps = '';
        _reg(fn, ln, lg, ps, function (callback) {
            assert.equal(callback.registration, false);
            done();
        });
    });
    it("undefined", function (done) {
        var fn = ln = lg = ps;
        _reg(fn, ln, lg, ps, function (callback) {
            assert.equal(callback.registration, false);
            done();
        });
    });
    it("длинного пользователя", function (done) {
        var fn = ln = lg = ps = '                                                                               ';
        _reg(fn, ln, lg, ps, function (callback) {
            assert.equal(callback.registration, false);
            done()
        });
    });

    it("спецсимвольного пользователя", function (done) {
            var fn = ln = lg = ps = USER_SYMB;
            _reg(fn, ln, lg, ps, function (callback) {
                assert.equal(callback.registration, true, callback.info);
                done();
        });
    });

});


describe("Авторизация", function() {

    it("созданного пользователя", function (done) {
            _login(USER, USER, function (callback) {
                assert.equal(callback.result, true);
                done();
        });
    });

    it("символьного пользователя", function (done) {
        _login(USER_SYMB, USER_SYMB, function (callback) {
            assert.equal(callback.result, true);
            done();
        });
    });


    it("не выполнена. Неверный логин/пароль", function (done) {
        _login(USER, USER_SYMB, function (callback) {
            assert.equal(callback.result, false);
            done();
        });
    });

    it("не выполнена. Пустой логин", function (done) {
        _login("", USER, function (callback) {
            assert.equal(callback.result, false);
            done();
        });
    });

    it("не выполнена. Пустой пароль", function (done) {
        _login(USER, "", function (callback) {
            assert.equal(callback.result, false);
            done();
        });
    })

    it("не выполнена. Слишком длинный логин", function (done) {
        _login(USER+USER+USER+USER, USER, function (callback) {
            assert.equal(callback.result, false);
            done();
        });
    });

    it("не выполнена. Слишком длинный пароль", function (done) {
        _login(USER, USER+USER+USER+USER, function (callback) {
            assert.equal(callback.result, false);
            done();
        });
    });
});

var room;
describe("Создание диалога", function() {

    let users = [USER, USER_SYMB],
        name = "test",
        from;

    before((done) => {
        _login(USER, USER, function (callback) {
            from = callback.name;
            done();
        });
    });

    it("с самим собой", function (done) {
        _addConversation(USER, name, from, function (result) {
            assert.notEqual(result.result, false);
            done();
        });
    });

    it("с двумя пользователями", function (done) {
        _addConversation(users, name, from, function (result) {
            room = result.id;
            assert.notEqual(result.result, false);
            done();
        });
    });

    it("с пустым названием", function (done) {
        _addConversation(USER, "", from, function (result) {
            assert.equal(result.result, false);
            done();
        });
    });

    it("без собеседников", function (done) {
        _addConversation("", name, from, function (result) {
            assert.equal(result.result, false);
            done();
        });
    });

    it("undefined", function (done) {
        _addConversation(undefined, undefined, from, function (result) {
            assert.equal(result.result, false);
            done();
        });
    });
});


describe("Отправка сообщений", function() {

    let text = "test text",
        url = "https://pp.userapi.com/c630517/v630517926/38563/sNW_e9jBjjA.jpg",
        name = "testMessages",
        from;

    before((done) => {
        _login(USER, USER, function (callback) {
            from = callback.name;
            _addConversation(USER, name, callback.name, function (result) {
                room = result.id;
                done();
            });
        });
});

    describe("Отправка текста", function () {

        it("Сообщение отправлено", function (done) {
            message(text, room, from, function (data) {
                try {
                    assert.equal(data.result, true);
                    done();
                } catch (e) { done(e); }
            });
        });

        it("Успешно вернуло сообщение", function (done) {
            message(text, room, from, function (data) {
                var text1 = data.backData.message.message;
                assert.equal(text1, text);
                done();
            });
        });

        it("Текстовый тип сообщения", function (done) {
            message(text, room, from, function (data) {
                assert.equal(data.result, true);
                done();
            });
        });

    });

    describe("Отправка картинки", function () {

        it("Картинка отправлена", function (done) {
            message(url, room, from, function (data) {
                assert.equal(data.result, true);
                done();
            });
        });

        it("Формат подтверждён", function (done) {
        message(url, room, from, function (data) {
            try{
                assert.notEqual(data.backData.image, undefined);
                done();
            } catch (error) { done(error); }
            });
        });
        it("Картинка скачена", function (done) {
            message(url, room, from, function (data) {
                assert.notEqual(data.backData.image.img_path, undefined);
                done();
            });
        });
    });

    describe("Обработка исключений", function () {

        it("Пустое сообщение", function (done) {
            message("", room, from, function (data) {
                assert.equal(data.result, false);
                done();
            });
        });

        it("Сообщение из пробелов", function (done) {
            message("               ", room, from, function (data) {
                assert.equal(data.result, false, "Сообщение из пробелов. info => " + data.info);
                done();
            });
        });

        it("Сообщение без указания диалога", function (done) {
            message(text, "", from, function (data) {
                assert.equal(data.result, false);
                done();
            });
        });

        it("Отправитель не подписан", function (done) {
            message(text, room, ".", function (data) {
                assert.equal(data.result, false);
                done();
            });
        });

        it("Экранирование спецсимволов", function (done) {
            message("<Script>...</Script>", room, from, function (data) {
                assert.equal(data.result, true)
                done();
            });
        });

        var url2 = "before http://minionomaniya.ru/wp-content/uploads/2015/11/minion-tankist-kartinka.jpg after";

        it("Распознование ссылки среди текста и загрузка изображения", function (done) {
            message(url2, room, from, function (data) {
                assert.notEqual(data.backData.image, undefined);
                done();
            })
        });

        it("Остаток сообщения без ссылки", function (done) {
            message(url2, room, from, function (data) {
                assert.notEqual(data.backData.message, undefined);
                done();
            })
        });
    });
});


describe("Загрузка сообщений", function() {

    let limit = 20;

    it("из тестовой комнаты", function (done) {
        loadMessages(room, limit, function (data) {
            assert(data.result != false)
            done();
        })
    });

    it("из ваакума", function (done) {
        loadMessages('', limit, function (data) {
            assert(data.result == false)
            done();
        })
    });

    it("без указания лимита выгрузки", function (done) {
        loadMessages(room, '', function (data) {

           try{
                assert(data.result == false)
            done();
           } catch(error) { done(error); }
        })
    });
});

describe("Очистка", function() {

    it("тестового пользователя", function (done) {
        _delUsr(USER, function (callback) {
            assert.equal(callback, true, callback.info);
            done();
        });
    });

    it("спецсимвольного пользователя", function (done) {
        _delUsr(USER_SYMB, function (callback) {
            assert.equal(callback, true, callback.info);
            done();
        });
    });

    it("тестового диалога", function (done) {
        _delConv(room, function (callback) {
            assert.equal(callback, true, callback.info);
            done();
        });
    });

});