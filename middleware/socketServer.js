var db = require('./dbWare'),
    path = require('path'),
    multiparty = require('multiparty'),
    users = [];

const login = require('../routes/login'),
    logger = require('./logger').logger(path.basename(__filename)),
    log = require('./logger').log,
    reg = require('../routes/register'),
    config = require('../config'),
    sha512 = require('js-sha512'),
    download = require('image-downloader');


module.exports = function (httpServer, SSLserver) {
    var io = require('socket.io').listen(httpServer).listen(SSLserver),
        form = new multiparty.Form();

    io.on('connection', function (socket) {

        socket.on('login', function (data, callback) {
            _login(data, function (data2) {
                callback(data2);
            })
        });

        socket.on('register', function (data, callback) {
            _register(data, function (data2) {
                callback(data2);
            })
        });

        socket.on('message', function (data, callback) {
            _message(data, function (data2) {
                if (data2.result) socket.broadcast.to(data.room).emit('NEW', data2.backData);
                callback(data2);
            })
        });

        socket.on('deleteMessage', function (data, callback) {
            _deleteMessage(data, function (data2) {
                callback(data2);
            })
        });

        socket.on('addConversation', function (data, callback) {
            _addConversation(data, function (data2) {
                callback(data2);
            })
        });

        socket.on('users', function (username) { //загрузка всех юзеров, в дальнейшем надо отключить
            db.getUsers(checkUser(username))
                .then(result => {
                    socket.emit('users', {rows: result});
                })
                .catch(error => {
                    log("WARN", "Ошибка при загрузке юзеров", error)
                })
        })

        socket.on('uploadFile', function (data, callback) {
            var username = checkUser(data.sendFrom);
            var d = {}
            db.addFile(data.room, username, data.path.substring(data.path.indexOf("/")), data.name)
                .then(result => {
                    var path = data.path.substring(data.path.indexOf("/"));
                    var text = data.name;
                    var id = result[0].id;
                    var date = result[0].date;
                    d.file = {path, text, sendFrom: username, id, date}
                    socket.broadcast.to(data.room).emit('NEW', d);
                    callback({path, text, username, id, date});
                })
                .catch(error => {
                    log("INFO", "Ошибка при добавлении файла в БД", error);
                })
        });

        socket.on('changeRoom', function (data, callback) {
            if (!data.room) callback({result: false, rows: false, info: "Ошибка. Не выбрана комната"})
            if (!data.limit) callback({result: false, rows: false, info: "Ошибка. Не выбран лимит"})
            socket.join(data.room);
            db.loadMessage(data.room, data.limit)
                .then(result => {
                    if (result)
                        callback({result: true, rows: result, info: "История загружена успешно."})
                })
                .catch(error => {
                    callback({result: false, rows: false, info: "Ошибка. Что-то пошло не так"})
                    log("INFO", "Ошибка при загрузке сообщений", error);
                });
        });

        socket.on('loadRoom', function (login, callback) {
            db.loadRoom(checkUser(login))
                .then(result => {
                    callback(result);
                    socket.emit('loadRoom', result);
                })
                .catch(error => {
                    callback({result: false, info: "Ошибка при загрузке диалогов"});
                    log("INFO", "Ошибка при загрузке диалогов", error);
                })
        });
    });   //трансопрт. Разделил что бы в дальнейшем можно было просто поменять траспорт. Лучше в отдлеьный файл кинуть
}

function normaMessage(text) {
    var result = text,
        col = true;
    if (text) {
        while (col) {
            result = result.replace(/\u0020+/, " ");
            result = result.replace(/\u0009+/, " ");
            result = result.replace(/\u000A+/m, '\n');
            if (result.match(/(&nbsp;){1,}/m) == null && result.match(/(<br>){1,}/m) == null) {
                col = false;
            }
        }
        return result.replace(/\xa0/gim, ' ').replace(/([\u0020]*$)/gim, '').replace(/(^[\u0020]+)/gim, '');
    } else {
        return text;
    }
}

function downloadImage(url1, type, sendFrom, room) {
    return new Promise(function (resolve, reject) {
        var t = Date.parse(new Date) + new Date().getMilliseconds(),
            name = sha512(url1 + sha512(t + "")),
            pathh = `/images/${name}.${type}`,
            options = {
                url: url1,
                dest: path.join(__dirname, "../public" + pathh)
            };
        download.image(options)
            .then(({filename, image}) => {
                db.addImage(room, sendFrom, pathh)
                    .then(result => {
                        var id_mes = result[0].id_message;
                        var date = result[0].date;
                        resolve({id_mes, date, pathh});
                    })
                    .catch(err => {
                        log("WARN", "Ошибка при загрузки изображения в БД", err)
                    })
            })
            .catch((err) => {
                log("INFO", "Ошибка при загрузке изображения", err);
                reject(false);
            })
    })
}

function checkURL(room, message, sendFrom) {
    return new Promise(function (resolve, reject) {
        var mes = message,
            res = true,
            ret = {},
            ret_array = [],
            i = 0,
            url = null;
        while (res) {
            try {
                var t = mes.match(/((http(s)?)|(www\.))([^\.]+)\.([^\s]+(jpg|png))/);
                if (t) {
                    url = t[0];
                    var type = t[7];
                    i++;
                } else {
                    res = false;
                    url = null;
                }

            } catch (e) {
                url = null;
                res = false;
            }

            mes = mes.replace(url, '');
            if (url != null && res) {
                downloadImage(url, type, sendFrom, room)
                    .then(result => {
                        ret.path = result.pathh;
                        ret.id = result.id_mes;
                        ret.date = result.date;
                        ret.message = mes;
                        ret_array.push(ret);
                        resolve({ret});
                    })
                    .catch(error => {
                        ret.message = message;
                        reject(ret);
                    });
            } else {
                ret.message = mes;
                if (i == 0) {
                    res = false;
                    reject(ret);
                }
            }
        }
        ret.message = mes;
    })
}

function handshake(username) {
    return sha512(username + sha512(config.secret));
}

function checkUser(text) {
    try {
        var u1 = text.substring(text.indexOf(".") + 1),
            u2 = handshake(text.substring(0, text.indexOf(".")));
    }
    catch (e) {
        return false;
    }
    if (u1 == u2)
        return text.substring(0, text.indexOf("."));
    else
        return false;
}

function clear_nbsp(text) {
    return text.replace(/\xa0/gim, ' ');
}

function clear_code_32(text) {
    return text.replace(/\xa0/gim, ' ').replace(/([\u0020]*$)/gim, '').replace(/(^[\u0020]+)/gim, '');
}

function accessText(text) {
    return text
        .replace(/[<>]/gim, function (i) {
            if (i.charCodeAt(0) == 60)
                return '&lt;'
            else
                return '&gt;'
        })
}

function _message(data, callback) {
    var r = true;
    if (!data.message) {
        r = false;
        callback({result: false, info: "Ошибка. Пустой текст."})
    }
    if (!data.sendFrom) {
        r = false;
        callback({result: false, info: "Ошибка. Не выбран отправитель."})
    }
    if (!data.room) {
        r = false;
        callback({result: false, info: "Ошибка. Не выбран диалог."})
    }
    if (data.message.length == 0) {
        r = false;
        callback({result: false, info: "Ошибка. Пустое сообщение.."})
    }
    var name = checkUser(data.sendFrom),
        room = data.room,
        onlySpace = true,
        backData = {},
        message = "";
    if (!name) {
        callback({result: false, info: "Ошибка подписи отправителя. "})
    }
    if (r) {
        checkURL(room, data.message, name)
            .then(result => {
                var path = result.ret.path,
                    id = result.ret.id,
                    date = result.ret.date;
                message = normaMessage(result.ret.message);
                if (path != undefined) {
                    backData.image = {
                        id: id,
                        sendFrom: name,
                        img_path: path,
                        date: date
                    };

                }
                if (message)
                    if (message.length != 0)
                        for (var i = 0; i < message.length; i++)
                            if (message[i].charCodeAt() != 32) {
                                onlySpace = false;
                                break;
                            }
                if (!onlySpace) {
                    db.addMessage(name, room, accessText(message))
                        .then(result => {
                            backData.message = {
                                sendFrom: name,
                                message: accessText(message),
                                date: result[0].date,
                                id: result[0].id_message
                            };
                            callback({result: true, backData, info: "Успешно."});
                        })
                        .catch(error => {
                            callback({
                                result: false,
                                backData,
                                info: "Ошибка при отправке сообщения."
                            })
                            log("INFO", "Ошибка при добавлении сообщения", error);
                        })
                } else {
                    if (!backData.image)
                        callback({result: false, info: "Ошибка. Пустое сообщение"})
                    callback({result: true, backData, info: "Успешно."});
                }
            })
            .catch(err => {
                message = normaMessage(err.message);
                if (message.length != 0)
                    for (var i = 0; i < message.length; i++)
                        if (message[i].charCodeAt() != 32) {
                            onlySpace = false;
                            break;
                        }
                if (onlySpace) {
                    r = false;
                    callback({result: false, info: "Ошибка. Пустое сообщение"})
                }
                if (r)
                    db.addMessage(name, room, accessText(message))
                        .then(result => {
                            backData.message = {
                                sendFrom: name,
                                message: accessText(message),
                                date: result[0].date,
                                id: result[0].id_message
                            };
                            callback({result: true, backData, info: "Успешно."});
                        })
                        .catch(error => {
                            log("INFO", "Ошибка при добавлении сообщения", error);
                        })
            })
    }
}

function _login(data, callback) {
    db.authorization(data.login, data.password)
        .then(result => {
            if (result) {
                login.f(result, data.login);
                login.addRooms(db.loadRoom(data.login));
                var name = data.login + '.' + handshake(data.login)
                callback({result: result, name: name});
            }
            else {
                callback({result: false, name: null, info: "логин/пароль не найден"});
            }
        })
        .catch(error => {
            login.f(false, null);
            log("INFO", "Ошибка при авторизации", error);
            callback({result: false, name: null});
        });
}

function _register(data, callback) {
    var userCookie = "";
    if (data.login &&
        data.pass &&
        data.firstName &&
        data.lastName)
        if (data.login.length <= 19 &&
            data.pass.length <= 19 &&
            data.firstName.length <= 19 &&
            data.lastName.length <= 19 &&
            data.login.length > 0 &&
            data.pass.length > 0 &&
            data.firstName.length > 0 &&
            data.lastName.length > 0) {
            db.register(data.login, data.pass, data.firstName, data.lastName)
                .then(result => {
                    login.f(result, data.login);
                    reg.f(result, data.login)
                    login.addRooms(db.loadRoom(data.login));
                    if (result) {
                        userCookie = data.login + '.' + handshake(data.login);
                        var info = "Done"
                    } else var info = "nope"

                    callback({registration: result, username: userCookie, info});
                })
                .catch(error => {
                    var registration = false;
                    callback({registration, error});
                    log("INFO", "Ошибка регистрации", error);
                })
        } else callback({registration: false, info: "не допустимое количество символов"})
    else callback({registration: false, info: "не допустимое количество символов"})
}

function _deleteMessage(data, callback) {
    db.deleteMessage(data.id_message, data.id_room)
        .then(result => {
            socket.broadcast.to(data.id_room).emit('delete', {id: data.id_message, room: data.id_room});
            callback(result);

        })
        .catch(error => {
            log("INFO", "Ошибка при удалении сообщения", error);
        })
}

function _addConversation(data, callback) {
    var r = true;
    if (!data.name) {
        r = false;
        callback({result: false, info: "Ошибка. Не выбрано название"});
    }
    if (!data.users) {
        r = false;
        callback({result: false, info: "Ошибка. Не выбраны пользователи"});
    }
    if (!checkUser(data.sendFrom)) {
        r = false;
        callback({result: false, info: "Ошибка. Пользователь не подписан"})
    }
    if (typeof(data.users) == "string") {
        var users = data.users.split(",")
    } else {
        var users = data.users;
    }

    var sendFrom = checkUser(data.sendFrom);
    if (r)
        db.addConversation(users, data.name)
            .then(result => {
                db.loadRoom(sendFrom)
                    .then(result => {
                        callback(result[0]);
                    });
            })
            .catch(error => {
                callback(false);
                log("INFO", "Ошибка при добавлении нового диалога в БД", [users, data.name, error]);
            })
}