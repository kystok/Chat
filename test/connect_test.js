QUnit.test("Connected", function (assert) {
    assert.expect();
    var done = assert.async();
    assert.ok(connect() == true, "сокет подключился!");
    done();
});
