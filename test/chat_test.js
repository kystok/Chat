var room;
var room2;
var name1 = "unit test dialog_1 " + t;
var name2 = "unit test dialog_2 " + t;
QUnit.test("Create room. 4 теста", function (assert) {
    assert.expect(4);
    var done = assert.async(4);
    var users = [name_global, simbol_global];
    var from = handshake;
    _addConversation(name_global, name1, from, function (result) {
        room2 = result.id;
        assert.ok(result.id != false, 'Диалог создан успешно. Один пользователь.');
        done();
    });
    _addConversation(users, name2, from, function (result) {
        room = result.id;
        assert.ok(result.id != false, 'Диалог создан успешно. Два пользователь.');
        done();
    });

    _addConversation(users, "", from, function (result) {
        assert.ok(result.result == false, 'Пустое название диалога. Ошибка.');
        done();
    });

    _addConversation("", "testing", from, function (result) {
        assert.ok(result.result == false, 'Не выбран собеседник. Ошибка.');
        done();
    });
});


QUnit.test("load messages 3 теста", function (assert) {
    assert.expect(3);
    var done = assert.async(3);

    var limit = 20;
    loadMessages(room, limit, function (data) {
        assert.ok(data.result != false, data.info)
        done();
    })

    loadMessages('', limit, function (data) {
        assert.ok(data.result == false, data.info)
        done();
    })

    loadMessages(room, "", function (data) {
        assert.ok(data.result == false, data.info)
        done();
    })


});

QUnit.test("Create message. 12 тестов", function (assert) {
    assert.expect(12);
    var done = assert.async(12);
    var text = "test text";

    var url = "https://pp.userapi.com/c630517/v630517926/38563/sNW_e9jBjjA.jpg";
    var sendFrom = handshake;
    message(text, room, sendFrom, function (data) {

        assert.equal(data.result, true, "Сообщение отправлено.");
        done();
        var text1 = data.backData.message.message;
        assert.equal(text1, text, "Успешно вернуло сообщение.");
        done();
        assert.notEqual(data.backData.message, undefined, "Тип сообщения - текстовое.");
        done();
    });

    message(url, room, sendFrom, function (data) {
        assert.notEqual(data.backData.image, undefined, "Тип сообщения - картинка.");
        done();
        assert.notEqual(data.backData.image.img_path, undefined, "Картинка скачена.");
        done();
    });

    message("", room, sendFrom, function (data) {
        assert.equal(data.result, false, "Сообщение пустое. info => " + data.info);
        done();
    });
    message("               ", room, sendFrom, function (data) {
        assert.equal(data.result, false, "Сообщение из пробелов. info => " + data.info);
        done();
    });

    message(text, "", sendFrom, function (data) {
        assert.equal(data.result, false, "Не выбран диалог.  info => " + data.info);
        done();
    });
    message(text, room, "UT_unitTest3", function (data) {
        assert.equal(data.result, false, "Отправитель не подписан. info => " + data.info);
        done();
    });

    message("<Script></Script>", room, sendFrom, function (data) {
        assert.equal(data.result, true, "Экранирование спецсимволов <Script></Script> = " + data.backData.message.message)
        done();
    });

    var url2 = "before http://minionomaniya.ru/wp-content/uploads/2015/11/minion-tankist-kartinka.jpg after";
    message(url2, room, sendFrom, function (data) {
        assert.notEqual(data.backData.image, undefined, "Распознование ссылки среди текста и загрузка изображения");
        done();
        assert.notEqual(data.backData.message, undefined, "Остаток сообщения без ссылки.");
        done();
    })
});

