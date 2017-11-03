QUnit.module('Cleat all testData');
QUnit.test('Clear', function (assert) {
    assert.expect();
    const done = assert.async();
    clear(name_global,name,room);
    assert.equal(true, true, "Подчистили все");
    done();
    clear(simbol_global,name2,null);
});

function clear(user, room, id) {
    socket.emit('clearAllTest', {user, room, id}, data=> {
    });
}
