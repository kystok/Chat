const DB = require('../../middleware/DBcore'),
    assert = require('chai').assert,
    rand = new Date().getMilliseconds(),
    USER = "testEGOR2" + rand,
    USER_SYMB = "[~#&];,:2" + rand,
    NAME = "testRoom" + rand;

let room;

before((done) => {
    DB.register(USER,USER,USER,USER)
        .then(result => {
            return DB.register(USER_SYMB,USER_SYMB,USER_SYMB,USER_SYMB);
        }).then( () => {
        done();
    });
});

after((done) => {
    DB.deleteUser(USER)
        .then(() => {
            return DB.deleteUser(USER_SYMB);
        }).then(() => {
        done();
    })
});

describe('.addConversation', () => {

    it('Добавление пустой комнаты', (done) => {
        DB.addConversation([USER], NAME)
            .then((result) => {
                assert.equal(result.result, true);
                done();
            })
    });

    it('Добавление обычной комнаты', (done) => {
        DB.addConversation([USER, USER], NAME)
            .then((result) => {
                assert.equal(result.result, true);
                done();
            })
    });

    it('Добавление комнаты без названия', (done) => {
        DB.addConversation([USER, USER], "")
            .catch((error) => {
                assert.notEqual(error, false);
                done();
            })
    });

    it('Добавление комнаты без участников', (done) => {
        DB.addConversation([], NAME)
            .catch((error) => {
                assert.notEqual(error, false);
                done();
            })
    });

    it('Добавление undefined комнаты', (done) => {
        DB.addConversation(undefined, undefined)
            .catch((error) => {
                assert.notEqual(error, false);
                done();
            })
    });




});