const t = new Date().getMilliseconds();
const name_global = "test_" + t;
const simbol_global = UserSimbol();
let handshake;


/**
 * @return {string}
 */
function UserSimbol() {
    let s = '[~!@#$%^&*()_+=-?/\];,.:';
    let result = "";
    for (let i = 0; i < 18; i++) {
        result += s[Math.floor(Math.random() * (20))];
    }
    return result;
}


QUnit.test("Registration", assert => {
    assert.expect(7);
    let done = assert.async(7);
    var fn = ln = lg = ps = name_global;
    _reg(fn, ln, lg, ps, callback => {
        assert.equal(callback.registration, true, "Все строки в пределах допустимого. Регистрация прошла успешно " + name_global);
        done();
        assert.notEqual(callback.username, null, "Кука передана");
        done();
        handshake = callback.username;
    });
    _reg(fn, ln, lg, ps, callback => {
        assert.equal(callback.registration, false, callback.info + " - логин уже существует. Регистрация не произведена");
        done();
    });
    fn = ln = lg = ps = '';
    _reg(fn, ln, lg, ps, callback => {
        assert.equal(callback.registration, false, "Пустые строки. Регистрация не произведена");
        done();
    });

    var fn,
        ln,
        lg,
        ps;
    _reg(fn, ln, lg, ps, function (callback) {
        assert.equal(callback.registration, false, "Cтроки undefined. Регистрация не произведена");
        done();
    });

    fn = ln = lg = ps = 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    _reg(fn, ln, lg, ps, function (callback) {
        assert.equal(callback.registration, false, "Cтроки слишком длинные. Регистрация не произведена");
        done();
    });

    fn = ln = lg = ps = simbol_global;
    _reg(fn, ln, lg, ps, function (callback) {
<<<<<<< HEAD
        assert.equal(callback.registration, true, "Спец.символы засщитаны. -- " + r + " -- Регистрация произведена. info:"+callback.info);
=======
        assert.equal(callback.registration, true, "Спец.символы засщитаны. -->  " + simbol_global + "  <-- Регистрация произведена");
>>>>>>> orlov
        done();
    });
});
