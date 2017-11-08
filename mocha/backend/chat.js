const CHAT = require('../../middleware/CHATcore.js'),
    assert = require('chai').assert,
    SHA512 = require('js-sha512'),
    DB = require('../../middleware/DBcore'),
    CONFIG = require('../../config');
describe('Chat core testing', () => {
    function hand(username) {
        return SHA512(username + SHA512(CONFIG.secret));
    }


    describe('Friend list', () => {
        let USER1 = 'test',
            USER2 = 'test2';
        before((done) => {
            DB.register(USER1, USER1, USER1, USER1)
                .then(() => {
                    return DB.register(USER2, USER2, USER2, USER2)
                }).then(() => {
                done();
            })
        });
        after((done) => {
            DB.query('DELETE FROM `friendList`' +
                ' WHERE `user` = (select `id` from `users` where `login` = ?) ' +
                'OR `user` = (select `id` from `users` where `login` = ?);', [USER1, USER2])
                .then(() => {
                    return DB.deleteUser(USER2);
                }).then(() => {
                return DB.deleteUser(USER1);
            }).then(() => {
                done()
            }).catch((e) => {
                done(e)
            }).catch((e) => {
                done(e)
            }).catch((e) => {
                done(e)
            })

        });

        it('Добавляем друга', (done) => {
            const data = {
                sendFrom: USER1 + "." + hand(USER1),
                friend: USER2
            };
            CHAT.addFriends(data)
                .then(result => {
                    assert.equal(result.result, true);
                    console.log('Друг добавлен успешно');
                    done();
                })
                .catch((err) => {
                    done(err)
                })
        });

    });

    describe('Нормализация текста', () => {
        before((done) => {
            console.log('-------Тест нормализация текста-------');
            done();
        });

        it('Убираем пробелы, если их более 1 подряд', (done) => {
            let text1 = "1 2    3          4",
                result1 = "1 2 3 4";
            try {
                assert.equal(CHAT.normaMessage(text1), result1);
                console.log("Было  ", text1);
                console.log("Cтало ", result1);
                done();
            } catch (e) {
                done(e);
            }
        });

        it('Убираем пробелы (No-Break Space)', (done) => {
            let text2 = "1 2     3   4",
                result2 = "1 2 3 4";
            try {
                assert.equal(CHAT.normaMessage(text2), result2);
                console.log("Было  ", text2);
                console.log("Cтало ", result2);
                done();
            } catch (e) {
                done(e);
            }
        });

        it('Убираем табы', (done) => {
            let text3 = "1   2                    3   4",
                result3 = "1 2 3 4";
            try {
                assert.equal(CHAT.normaMessage(text3), result3);
                console.log("Было  ", text3);
                console.log("Cтало ", result3);
                done();
            } catch (e) {
                done(e);
            }
        });


        it('Убираем пробелы вначале текста', (done) => {
            let text4 = "           1   2 3   4",
                result4 = "1 2 3 4";
            try {
                assert.equal(CHAT.normaMessage(text4), result4);
                console.log("Было  ", text4);
                console.log("Cтало ", result4);
                done();
            } catch (e) {
                done(e);
            }
        });

        it('Убираем пробелы в конце текста', (done) => {
            let text5 = "1   2 3   4        ",
                result5 = "1 2 3 4";
            assert.equal(CHAT.normaMessage(text5), result5);
            console.log("Было  ", text5);
            console.log("Cтало ", result5);
            done();
        });
    });

    describe('Проверка подписи отправителя', () => {

        before((done) => {
            console.log('-------Тест проверки подписи-------');
            done();
        });


        const text1 = "usertestblabla",
            result1 = hand(text1);

        it('Проверка создания подписи', (done) => {
            try {
                assert.equal(CHAT.handshake(text1), result1);
                console.log("login: ", text1);
                console.log("Подпись: ", result1);
                done();
            } catch (e) {
                done(e);
            }
        });

        it('Проверка подписи', (done) => {
            try {
                const req = text1 + "." + result1;
                assert.equal(CHAT.checkUser(req), text1);
                console.log("Подписанный пользователь: ", req)
                console.log("Результат: ", text1);
                done();
            } catch (e) {
                done(e);
            }
        });
        it('Проверка не правильной подписи', (done) => {
            const req = text1 + ".werc" + result1;
            try {
                assert.equal(CHAT.checkUser(req), false);
                console.log("Подписанный пользователь: ", req)
                console.log("Результат: ", false);
                done();
            } catch (e) {
                done(e);
            }
        });

        it('Проверка входных данных без подписи', (done) => {
            const req = text1;
            try {
                assert.equal(CHAT.checkUser(req), false);
                console.log("Подписанный пользователь: ", req)
                console.log("Результат: ", false);
                done();
            } catch (e) {
                done(e);
            }
        })
    });

    describe('Защита от XSS атак', () => {

        before((done) => {
            console.log('-------Тест защиты от XSS-------')
            done();
        });
        let text1 = "<script>alert('xss');</script>",
            result1 = "&lt;script&gt;alert(\'xss\');&lt;/script&gt;";

        it('Экранирование  < и > ', (done) => {
                try {
                    assert.equal(CHAT.accessText(text1), result1);
                    console.log("Входной текст: ", text1);
                    console.log("Результат: ", result1);
                    done();
                }
                catch
                    (e) {
                    done(e);
                }
            }
        );
    });

    describe('Проверка входных данных', () => {
        before((done) => {
            console.log('-------Тест проверки входных данных-------');
            done();
        });
        it('Проверка на смс из пробелов', (done) => {
            let text1 = "               ";
            try {
                assert.equal(CHAT.isSpaced(text1), true);
                console.log("Входной текст: '", text1, "'");
                console.log("Результат: ", true, " (смс из пробелов)");
                done();
            } catch (e) {
                done(e);
            }
        });
        it('Проверка на смс не из пробелов', (done) => {
            let text1 = "       NotOnlyIsSpace        ";
            try {
                assert.equal(CHAT.isSpaced(text1), false);
                console.log("Входной текст: '" + text1 + "'");
                console.log("Результат: ", false, " (смс без пробелов)");
                done();
            } catch (e) {
                done(e);
            }
        });
        it('Проверка на существование входных данных', (done) => {
            let text1 = "тут есть текст";
            try {
                assert.equal(CHAT.isEmpty(text1), false);
                console.log("Входной текст: '" + text1 + "'");
                console.log("Результат: ", false, " (входные данные существует)");
                done();
            } catch (e) {
                done(e);
            }
        });
        it('Проверка на НЕ существование входных данных', (done) => {
            let text1;
            try {
                assert.equal(CHAT.isEmpty(text1), true);
                console.log("Входной текст: '" + text1 + "'");
                console.log("Результат: ", true, " (входныx данных НЕ существует)");
                done();
            } catch (e) {
                done(e);
            }
        });
        it('Проверка на НЕ существование входных данных', (done) => {
            let text1 = "";
            try {
                assert.equal(CHAT.isEmpty(text1), true);
                console.log("Входной текст: '" + text1 + "'");
                console.log("Результат: ", true, " (входныx данных НЕ существует)");
                done();
            } catch (e) {
                done(e);
            }
        });
        describe('Проверка входных данных для регистрации', () => {
            it('Заполненные входные данные', (done) => {
                let firstName, lastName, login, password,
                    data = {
                        firstName: "test",
                        lastName: "test",
                        login: "test",
                        password: "test"
                    };
                try {
                    assert.equal(CHAT.isReadyForReg(data), true);
                    console.log("Входной текст: '" + JSON.stringify(data) + "'");
                    console.log("Результат: ", true, "");
                    done();
                } catch (e) {
                    done(e);
                }
            });
            it('Пустые входные данные', (done) => {
                let firstName, lastName, login, password,
                    data = {
                        firstName: "",
                        lastName: "",
                        login: "",
                        password: ""
                    };
                try {
                    assert.equal(CHAT.isReadyForReg(data), false);
                    console.log("Входной текст: '" + JSON.stringify(data) + "'");
                    console.log("Результат: ", false, " (входные данные пустые)");
                    done();
                } catch (e) {
                    done(e);
                }
            });
            it('Пустые некоторые входные данные', (done) => {
                let firstName, lastName, login, password,
                    data = {
                        firstName: "",
                        lastName: "",
                        login: "test",
                        password: "test"
                    };
                try {
                    assert.equal(CHAT.isReadyForReg(data), false);
                    console.log("Входной текст: '" + JSON.stringify(data) + "'");
                    console.log("Результат: ", false, "");
                    done();
                } catch (e) {
                    done(e);
                }
            });
            it('Данные undefined', (done) => {
                let firstName, lastName, login, password,
                    data = {
                        firstName,
                        lastName,
                        login,
                        password
                    };
                try {
                    assert.equal(CHAT.isReadyForReg(data), false);
                    console.log("Входной текст: '" + JSON.stringify(data) + "'");
                    console.log("Результат: ", false, "");
                    done();
                } catch (e) {
                    done(e);
                }
            });
        })
        describe('Проверка входных данных для входа в систему', () => {
            it('Заполненные входные данные', (done) => {
                let login, password,
                    data = {
                        login: "test",
                        password: "test"
                    };
                try {
                    assert.equal(CHAT.isReadyForLog(data), true);
                    console.log("Входной текст: '" + JSON.stringify(data) + "'");
                    console.log("Результат: ", true, "");
                    done();
                } catch (e) {
                    done(e);
                }
            });
            it('Пустые входные данные', (done) => {
                let login, password,
                    data = {
                        login: "",
                        password: ""
                    };
                try {
                    assert.equal(CHAT.isReadyForLog(data), false);
                    console.log("Входной текст: '" + JSON.stringify(data) + "'");
                    console.log("Результат: ", false, " (входные данные пустые)");
                    done();
                } catch (e) {
                    done(e);
                }
            });
            it('Пустые некоторые входные данные', (done) => {
                let login, password,
                    data = {
                        login: "",
                        password: "test"
                    };
                try {
                    assert.equal(CHAT.isReadyForLog(data), false);
                    console.log("Входной текст: '" + JSON.stringify(data) + "'");
                    console.log("Результат: ", false, "");
                    done();
                } catch (e) {
                    done(e);
                }
            });
            it('Данные undefined', (done) => {
                let login, password,
                    data = {
                        login,
                        password
                    };
                try {
                    assert.equal(CHAT.isReadyForLog(data), false);
                    console.log("Входной текст: '" + JSON.stringify(data) + "'");
                    console.log("Результат: ", false, "");
                    done();
                } catch (e) {
                    done(e);
                }
            });
        })
    });

    describe('Загрузка изображений', () => {
        before((done) => {
            console.log('-------Тест загрузки изображений-------');
            done();
        });
        it('загрузка существующего изображения', (done) => {
            let url = "https://pp.userapi.com/c630222/v630222926/15d52/8QCKABC0mAY.jpg";
            CHAT.downloadImage(url, 'jpg')
                .then(result => {
                    try {
                        assert.notEqual(result.pathImg, false);
                        console.log("Входной текст: '", url, "'");
                        console.log("Результат: ", result.pathImg, " (изображение загружено)");
                        done();
                    } catch (e) {
                        done(e);
                    }

                })
                .catch(err => {
                    console.log(url)
                    console.log(err);
                    assert.notEqual(err, false);
                    console.log("Входной текст: '", url, "'");
                    console.log("Ошибка: ", err, " (изображение не загружено)");
                    done(err);
                })
        });
    });
})