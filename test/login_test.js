QUnit.test("log In", function (assert) {
    const name = name_global;
    assert.expect(5);
    const done = assert.async(5);
    _login(name, name, function (callback) {
        assert.equal(callback.result, true, "Вход выполнен." + name);
        done();
    });
    const name2 = simbol_global;
    _login(name2, name2, function (callback) {
        assert.equal(callback.result, true, "Вход выполнен. Символы защитаны " + name2);
        done();
    });

    _login('   ', ' we  ', function (callback) {
        assert.equal(callback.result, false, "Вход не выполнен.Неверный логин/пароль");
        done();
    });

    _login('', '', function (callback) {
        assert.equal(callback.result, false, "Вход не выполнен.Пустые логин/пароль");
        done();
    });

    const name1 = name + name + name;
    _login(name1, name1, function (callback) {
        assert.equal(callback.result, false, "Вход не выполнен.Значения слишком длинные" + name1);
        done();
    });
});