const DB = require('../../middleware/DBcore'),
    assert = require('chai').assert,
    rand = new Date().getMilliseconds(),
    USER = "testEGOR1" + rand,
    USER_SYMB = "[~#&];,:1" + rand;

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
        });
});

describe('.authorization', () => {

    it('Нормальная авторизация', (done) => {
        DB.authorization(USER,USER)
            .then(result => {
                assert.notEqual(result, false);
                done();
            })
    });

    it('Нормальная авторизация (символьный)', (done) => {
        DB.authorization(USER_SYMB,USER_SYMB)
            .then(result => {
                assert.notEqual(result, false);
                done();
            })
    });

    it('Неверный login/password', (done) => {
        DB.authorization(USER,USER_SYMB)
            .then(result => {
                assert.notEqual(result, true);
                done();
            })
    });

    it('Пустой логин', (done) => {
        DB.authorization("",USER)
            .then(result => {
                assert.notEqual(result, true);
                done();
            })
    });

    it('Пустой пароль', (done) => {
        DB.authorization(USER,"")
            .then(result => {
                assert.notEqual(result, true);
                done();
            })
    });

    it('Слишком длинный логин', (done) => {
        DB.authorization(USER+USER+USER+USER+USER+USER,USER)
            .catch(error => {
                assert.notEqual(error,false);
                done();
            })
    });

    it('Слишком длинный пароль', (done) => {
        DB.authorization(USER,USER+USER+USER+USER+USER+USER)
            .then(result => {
                assert.notEqual(result, true);
                done();
            })
    });

    it('undefined', (done) => {
        DB.authorization(undefined,undefined)
            .catch(error => {
                assert.notEqual(error, false);
                done();
            })
    });

});