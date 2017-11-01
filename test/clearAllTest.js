QUnit.module('Clear before testing');
QUnit.test('Clear', function (assert) {
    assert.expect();
    var done = assert.async();
    clear();
    assert.equal(true, true, "Подчистили все");
    done();
})

function clear() {
    socket.emit('clearAllTest', {user: name_global, room: name1, id: room});
    socket.emit('clearAllTest', {user: simbol_global, room: name2, id: null});
}
