describe("Сообщения", () => {

    let text = "test text",
    url = "https://pp.userapi.com/c630517/v630517926/38563/sNW_e9jBjjA.jpg",
    rand = new Date().getMilliseconds();
    name = "testMessages" + rand,
    USER = "testEGOR3" + rand,
    USER_SYMB = "[~#&];,:3" + rand,
    from = room = 0;


    before((done) => {
        _reg(USER, USER, USER, USER, function(callback) {
            _reg(USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB, function(callback) {
                _login(USER, USER, function(callback) {
                    from = callback.name;
                    _addConversation(USER, name, callback.name, function(result) {
                        console.log(result);
                        room = result.id;
                        done();
                    });
                });
            });
        });
    });

    after((done) => {
        _delUsr(USER, function(callback) {
            _delUsr(USER_SYMB, function(callback) {
                _delConv(room, function(callback) {
                    done();
                });
            });
        });
    });  


describe("Отправка сообщений", function() {

    describe("Отправка текста", function() {

        it("Сообщение отправлено", function(done) {
            message(text, room, from, function(data) {
                try {
                    assert.equal(data.result, true);
                    done();
                } catch (e) { done(e); }
            });
        });

        it("Успешно вернуло сообщение", function(done) {
            message(text, room, from, function(data) {
                var text1 = data.backData.message.message;
                try {
                    assert.equal(text1, text);
                    done();
                } catch (e) { done(e) };
            });
        });

        it("Текстовый тип сообщения", function(done) {
            message(text, room, from, function(data) {
                try {
                    assert.equal(data.result, true);
                    done();
                } catch (e) { done(e) };
            });
        });

    });

    describe("Отправка картинки", function() {

        it("Картинка отправлена", function(done) {
            message(url, room, from, function(data) {
                try {
                    assert.equal(data.result, true);
                    done();
                } catch (e) { done(e) };
            });
        });

        it("Формат подтверждён", function(done) {
            message(url, room, from, function(data) {
                try {
                    assert.notEqual(data.backData.image, undefined);

                    done();
                } catch (e) { done(e) }
            });
        });

        it("Картинка скачена", function(done) {
            message(url, room, from, function(data) {
                try {
                    assert.notEqual(data.backData.image.imgpath, undefined);
                    done();
                } catch (e) { done(e) };
            });
        });
    });

    describe("Обработка исключений", function() {

        it("Пустое сообщение", function(done) {
            message("", room, from, function(data) {
                try {
                    assert.equal(data.result, false);
                    done();
                } catch (e) { done(e) };
            });
        });

        it("Сообщение из пробелов", function(done) {
            message("               ", room, from, function(data) {
                try {
                    assert.equal(data.result, false, "Сообщение из пробелов. info => " + data.info);
                    done();
                } catch (e) { done(e) };
            });
        });

        it("Сообщение без указания диалога", function(done) {
            message(text, "", from, function(data) {
                try {
                    assert.equal(data.result, false);
                    done();
                } catch (e) { done(e) };
            });
        });

        it("Отправитель не подписан", function(done) {
            message(text, room, ".", function(data) {
                try {
                    assert.equal(data.result, false);
                    done();
                } catch (e) { done(e) };
            });
        });

        it("Экранирование спецсимволов", function(done) {
            message("<Script>...</Script>", room, from, function(data) {
                try {
                    assert.equal(data.result, true)
                    done();
                } catch (e) { done(e) };
            });
        });

        url = "before http://minionomaniya.ru/wp-content/uploads/2015/11/minion-tankist-kartinka.jpg after";

        it("Распознование ссылки среди текста и загрузка изображения", function(done) {
            message(url, room, from, function(data) {
                try {
                    assert.notEqual(data.backData.image, undefined);
                    done();
                } catch (e) { done(e) };
            })
        });

        it("Остаток сообщения без ссылки", function(done) {
            message(url, room, from, function(data) {
                try {
                    assert.notEqual(data.backData.message, undefined);
                    done();
                } catch (e) { done(e) };
            })
        });
    });
});

    describe("Загрузка сообщений", function() {
        let limit = 20;

        it("из тестовой комнаты", function(done) {
            loadMessages(room, limit, function(data) {
                try {
                    assert(data.result != false)
                    done();
                } catch (e) { done(e) };
            })
        });

        it("из ваакума", function(done) {
            loadMessages('', limit, function(data) {
                try {
                    assert(data.result == false)
                    done();
                } catch (e) { done(e) };
            })
        });

        it("без указания лимита выгрузки", function(done) {
            loadMessages(room, '', function(data) {
                try {
                    assert(data.result == false)
                    done();
                } catch (e) { done(e); }
            })
        });
    });

});