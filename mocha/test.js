
const USER = "testEGOR";


describe("WS connection", function() {

  it("Подключение к серверу", function(done) {
    assert.equal(connect(), true);
    done();
  });

});

describe("Регистрация", function() {

    it("нового пользователя", function(done) {
        var fn = ln = lg = ps = USER;
        _reg(fn, ln, lg, ps, function (callback) {
            assert.equal(callback.registration, true);
            done();
        });
    });
    
    it("существующего пользователя", function (done) {
        var fn = ln = lg = ps = USER;
        _reg(fn, ln, lg, ps, function (callback) {
            assert.equal(callback.registration, false);
            done();
            //handshake = callback.username;
        });
    });

    it("пустого пользователя", function (done) {
        var fn = ln = lg = ps = '';
        _reg(fn, ln, lg, ps, function (callback) {
            assert.equal(callback.registration, false);
            done();
        });
    });
    it("undefined", function (done) {
        var fn = ln = lg = ps;
        _reg(fn, ln, lg, ps, function (callback) {
            assert.equal(callback.registration, false);
            done();
        });
    });
    it("длинного пользователя", function (done) {
        var fn = ln = lg = ps = '                                                                               ';
        _reg(fn, ln, lg, ps, function (callback) {
            assert.equal(callback.registration, false);
            done()
        });
    });

    it("спецсимвольного пользователя", function (done) {
            var fn = ln = lg = ps = '[~#&\];,:';
            _reg(fn, ln, lg, ps, function (callback) {
                assert.equal(callback.registration, true, callback.info);
                done();
        });
    });

});

describe("Очистка", function() {

    it("тестового пользователя", function (done) {
        _delUsr(USER, function (callback) {
            assert.equal(callback, true, callback.info);
            done();
        });
    });

    it("спецсимвольного пользователя", function (done) {
        _delUsr('[~#&];,:', function (callback) {
            assert.equal(callback, true, callback.info);
            done();
        });
    });

});
/*
var t = new Date().getMilliseconds();

var name_global = "test_" + t;
var handshake;
var simbol_global = UserSimbol();
QUnit.module("Registration module unit test");
function UserSimbol() {
    var s = '[~!@#$%^&*()_+=-?/\];,.:';
    var result = "";
    for (var i = 0; i < 18; i++) {
        var rand = Math.random() * (20);
        result += s[Math.floor(rand)];
    }
    return result;
}

QUnit.test("Registration", function (assert) {


    assert.expect(7);
    var done = assert.async(7);
    var fn = ln = lg = ps = name_global;
    _reg(fn, ln, lg, ps, function (callback) {
        assert.equal(callback.registration, true, "Все строки в пределах допустимого. Регистрация прошла успешно "+name_global);
        done();
        assert.notEqual(callback.username, null, "Кука передана");
        done();
        handshake = callback.username;
    });
    _reg(fn, ln, lg, ps, function (callback) {
        assert.equal(callback.registration, false, callback.info + " - логин уже существует. Регистрация не произведена");
        done();
    });
    fn = '';
    ln = '';
    lg = '';
    ps = '';
    _reg(fn, ln, lg, ps, function (callback) {
        assert.equal(callback.registration, false, "Пустые строки. Регистрация не произведена");
        done();
    });

    var fn;
    var ln;
    var lg;
    var ps;
    _reg(fn, ln, lg, ps, function (callback) {
        assert.equal(callback.registration, false, "Cтроки undefined. Регистрация не произведена");
        done();
    });

    fn = ln = lg = ps = 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    _reg(fn, ln, lg, ps, function (callback) {
        assert.equal(callback.registration, false, "Cтроки слишком длинные. Регистрация не произведена");
        done();
    });

    var r = simbol_global;
    fn = ln = lg = ps = r;
    _reg(fn, ln, lg, ps, function (callback) {
        assert.equal(callback.registration, true, "Спец.символы засщитаны. -- " + r + " -- Регистрация произведена. info:"+callback.info);
        done();
    });
});
*/