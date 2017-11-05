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
            _login(data, function (confirm) {
                callback(confirm);
            });
        });

        socket.on('register', function (data, callback) {
            _register(data, function (confirm) {
                callback(confirm);
            });
        });

        socket.on('message', function (data, callback) {
            _message(data, function (message) {
                if (message.result) socket.broadcast.to(data.room).emit('NEW', message.backData);
                callback(message);
            });
        });

        socket.on('deleteMessage', function (data, callback) {
            _deleteMessage(data, function (result) {
                callback(result);
            });
        });

        socket.on('addConversation', function (data, callback) {
            _addConversation(data, function (result) {
                callback(result);
            });
        });

        socket.on('users', function (username) { //загрузка всех юзеров, в дальнейшем надо отключить
            db.getUsers(checkUser(username))
                .then(result => {
                    socket.emit('users', {rows: result});
                })
                .catch(error => {
                    log("DBcore", "Ошибка при загрузке юзеров", error)
                });
        });

        socket.on('deleteUser', function (username, callback) {
            _deleteUser(username, function (result) {
                callback(result);
            });
        });

        socket.on('deleteConversation', function (room, callback) {
            _deleteConversation(room, function (result) {
                callback(result);
            });
        });

        socket.on('uploadFile', function (data, callback) {
            let username = checkUser(data.sendFrom),
                message = {};
            db.addFile(data.room, username, data.path.substring(data.path.indexOf("/")), data.name)
                .then(result => {
                    let path = data.path.substring(data.path.indexOf("/")),
                        text = data.name,
                        id = result[0].id,
                        date = result[0].date;
                    message.file = {path, text, sendFrom: username, id, date};
                    socket.broadcast.to(data.room).emit('NEW', message);
                    callback({result : true, path, text, username, id, date});
                })
                .catch(error => {
                    log("DBcore", "Ошибка при добавлении файла в БД", error);
                    callback({result : false, error : error});
                });
        });

        socket.on('changeRoom', function (data, callback) {
             (!data.room) ? callback({result: false, rows: false, info: "Ошибка. Не выбрана комната"}) :
                 (!data.limit) ? callback({result: false, rows: false, info: "Ошибка. Не выбран лимит"}) : "";
            socket.join(data.room);
            db.loadMessage(data.room, data.limit)
                .then(result => {
                    (result) ? callback({result: true, rows: result, info: "История загружена успешно."}) :
                        callback({result: false, rows: false, info: "Ошибка. Что-то пошло не так"});
                }).catch(error => {
                    callback({result: false, rows: false, info: "Ошибка. Что-то пошло не так"});
                    log("DBcore", "Ошибка при загрузке сообщений", error);
                });
        });


        //трансопрт. Разделил что бы в дальнейшем можно было просто поменять траспорт. Лучше в отдлеьный файл кинуть
        socket.on('loadRoom', function (login, callback) {
            db.loadRoom(checkUser(login))
                .then(result => {
                    callback(result);
                    socket.emit('loadRoom', result);
                })
                .catch(error => {
                    callback({result: false, info: "Ошибка при загрузке диалогов"});
                    log("DBcore", "Ошибка при загрузке диалогов", error);
                })
        });
    });
}

function normaMessage(text) {
    return text
        .replace(/\u0020+/, " ")
        .replace(/\u0009+/, " ")
        .replace(/\u000A+/m, '\n')
        .replace(/\xa0/gim, ' ')
        .replace(/([\u0020]*$)/gim, '')
        .replace(/(^[\u0020]+)/gim, '');
}

function downloadImage(url, type, sendFrom, room) {
    return new Promise(function (resolve, reject) {
        let t = Date.parse(new Date) + new Date().getMilliseconds(),
            name = sha512(url + sha512(t + "")),
            pathh = `/images/${name}.${type}`,
            options = {
                url: url,
                dest: path.join(__dirname, "../public/" + pathh )
            };

        download.image(options)
            .then(({filename, image}) => {
                return db.addImage(room, sendFrom, pathh)
            }).catch((err) => {
                log("image-downloader", "Ошибка при загрузке изображения", err);
                reject(false);
            }).then(result => {
                let id_mes = result[0].id_message,
                    date = result[0].date;
                resolve({id_mes, date, pathh})
            }).catch((err) => {
                log("DBcore", "Ошибка при загрузе изображения", err);
                reject(false);
            });
    });
}

function checkURL(room, message, sendFrom) {
    return new Promise(function (resolve, reject) {
        let match = message.match(/((http(s)?)|(www\.))([^\.]+)\.([^\s]+(jpg|png))/);
            ret = {message : message};

        (!match) ? resolve(ret) : "";

        downloadImage(match[0], match[7], sendFrom, room)
            .then(result => {
                let ret = {
                    path : result.pathh,
                    id : result.id_mes,
                    date : result.date,
                    message : message
                };
                resolve(ret);
            }).catch(error => {
                log("image-downloader","Ошибка при загрузке изображения" ,error)
                resolve(ret);
            });
    });
}

function handshake(username) {
    return sha512(username + sha512(config.secret));
}

function checkUser(text) {
    return (text.substring(text.indexOf(".") + 1) != handshake(text.substring(0, text.indexOf("."))) ) ? false :
        text.substring(0, text.indexOf("."));
}

function isSpaced(message){
    return (message.replace(/ /g,"").length < 1) ? true : false;
}

function isEmpty(data){
    return (data == undefined || data.length < 1) ? true : false;
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
            return (i.charCodeAt(0) == 60) ? '&lt;' : '&gt;';
        })
}

function _message(data, callback) {
    (!data.message || isSpaced(data.message)) ? callback({result: false, info: "Ошибка. Пустой текст."}) :
        (!data.room) ? callback({result: false, info: "Ошибка. Не выбран диалог."}) :
             (!data.sendFrom) ? callback({result: false, info: "Ошибка. Не выбран отправитель."}) :
                (data.message.length == 0) ? callback({result: false, info: "Ошибка. Пустое сообщение."}) :
                    (!checkUser(data.sendFrom)) ? callback({result: false, info: "Ошибка подписи отправителя. "}) :"";

    let name = checkUser(data.sendFrom),
        room = data.room,
        backData = {},
        message = normaMessage(data.message);

        checkURL(room, message, name)
            .then( result => {
                if (!isEmpty(result.path))
                    backData.image = {
                        id: result.id,
                        sendFrom: name,
                        img_path: result.path,
                        date: result.date
                    };
                return db.addMessage(name, room, accessText(message))
            }).then( result => {
                backData.message = {
                    sendFrom: name,
                    message: accessText(message),
                    date: result[0].date,
                    id: result[0].id_message
                };
                callback({result: true, backData, info: "Успешно."});
            }).catch(error => {
                log("DBcore", "Ошибка при добавлении сообщения", error);
                callback({ result: false, backData, info: "Ошибка при отправке сообщения."});
            });
}

function _login(data, callback) {
    db.authorization(data.login, data.password)
        .then(auth => {
            console.log(auth.result);
            (auth != 1) ? callback({result: false, name: null, info: "wrong login/password"} ) : "";
            login.f(true, data.login);
            login.addRooms(db.loadRoom(data.login));
            var name = data.login + '.' + handshake(data.login);
            callback({result: true, name: name});
        })
        .catch(error => {
            login.f(false, null);
            log("INFO", "Ошибка при авторизации", error);
            callback({result: false, name: null, info : error});
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
    (!data.name) ? callback({result: false, info: "Ошибка. Не выбрано название"}) :
        (!data.users) ? callback({result: false, info: "Ошибка. Не выбраны пользователи"}) :
            (!checkUser(data.sendFrom)) ? callback({result: false, info: "Ошибка. Пользователь не подписан"}) : "";
    var sendFrom = checkUser(data.sendFrom),
        users;
    (typeof(data.users) == "string") ? users = data.users.split(",") : users = data.users;
    db.addConversation(users, data.name)
        .then(result => { return db.loadRoom(sendFrom) })
        .then(result => { callback(result[0]) })
        .catch(error => {
            callback({result: false, info: "SQL error"});
            log("INFO", "Ошибка при добавлении нового диалога в БД", [users, data.name, error]);
        });
}

function _deleteUser(username, callback) {
    db.deleteUser(username)
        .then(result => {
        log("INFO", result);
        callback(true);
})
.catch(error => {
        log("INFO", "Ошибка при удалении пользователя", error);
        callback(false);
})
};

function _deleteConversation(room, callback) {
    db.deleteConversation(room)
        .then(result => {
        log("INFO", result);
    callback(true);
})
.catch(error => {
        log("INFO", "Ошибка при удалении комнаты", error);
    callback(false);
})
};