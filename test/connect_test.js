QUnit.test("Connected", function (assert) {
    assert.expect();
    const done = assert.async();
    assert.ok(connect() == true, "сокет подключился!");
    done();
});
