const DB = require('../../middleware/DBcore'),
    assert = require('chai').assert,
    rand = new Date().getMilliseconds(),
    USER = "testEGOR" + rand,
    USER_SYMB = "[~#&];,:" + rand;

after((done) => {
    DB.deleteUser(USER).then(() => {
        return DB.deleteUser(USER_SYMB)
    }).then(() => {
        done();
    })
});

describe('.register', () => {

    it('Нормальная регистрация', (done) => {
        DB.register(USER,USER,USER,USER)
            .then(result => {
                assert.notEqual(result, false);
                    done();
            })
    });

    it('Нормальная регистрация (спецсимольный)', (done) => {
        DB.register(USER_SYMB, USER_SYMB, USER_SYMB, USER_SYMB)
            .then(result => {
                assert.notEqual(result, false);
                done();
            })
    });

    it('Регистрация созданного пользователя', (done) => {
        DB.register("",USER,"","")
            .catch(error => {
                assert.notEqual(error, false);
                done();
            })
    });

    it('Регистрация с пустым логином', (done) => {
        DB.register("",USER,"","")
            .catch(error => {
                assert.notEqual(error, false);
                done();
            })
    });

    it('Регистрация с пустым паролем', (done) => {
        DB.register(USER,"","","")
            .catch(error => {
                assert.notEqual(error, false);
                done();
            })
    });

    it('Регистрация undefined', (done) => {
        DB.register(undefined,undefined,undefined,undefined)
            .catch(error => {
                assert.notEqual(error, false);
                done();
            })
    });

    it('Регистрация слишком длинного логина', (done) => {
        DB.register(USER+USER+USER+USER+USER,USER,USER,USER)
            .catch(error => {
                assert.notEqual(error, false);
                done();
            })
    });

    it('Регистрация слишком длинного пароля', (done) => {
        DB.register(USER,USER+USER+USER+USER+USER,USER,USER)
            .catch(error => {
                assert.notEqual(error, false);
                done();
            })
    });

});