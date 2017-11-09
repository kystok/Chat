const log = require('./logger').log,
    CONFIG = require('../config'),
    SHA512 = require('js-sha512'),
    DOWNLOAD = require('image-downloader'),
    PATH = require('path'),
    DB = require('./DBcore');

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
        let date = Date.parse(new Date) + new Date().getMilliseconds(),
            name = SHA512(url + SHA512(date + "")),
            pathImg = `/images/${name}.${type}`,
            options = {
                url: url,
                dest: PATH.join(__dirname, "../public/" + pathImg )
            };

        DOWNLOAD.image(options)
            .then(({filename, image}) => {
                return DB.addImage(room, sendFrom, pathImg)
            }).catch((err) => {
                log("image-downloader", "Ошибка при загрузке изображения", err);
                reject(false);
            }).then(result => {
                let idmes = result[0].idmessage,
                date = result[0].date;
                resolve({idmes, date, pathImg})
            }).catch((err) => {
                log("WARN", "Ошибка при загрузе изображения", err);
                reject(false);
        });
    });
}

function checkURL(room, message, sendFrom) {
    return new Promise((resolve, reject) => {
        let match = message.match(/((http(s)?)|(www\.))([^\.]+)\.([^\s]+(jpg|png))/);

        (!match) ? resolve({message : message}) :
        downloadImage(match[0], match[7], sendFrom, room)
            .then(result => {
                let ret = {
                    path : result.pathImg,
                    id : result.idmes,
                    date : result.date,
                    message : message
                };
                resolve(ret);
            }).catch(error => {
                log("image-downloader","Ошибка при загрузке изображения" ,error);
                resolve({message : message});
            });
    });
}

function checkUser(text) {
    try {
        return (text.substring(text.indexOf(".") + 1) != handshake(text.substring(0, text.indexOf("."))) ) ? false :
            text.substring(0, text.indexOf("."));
    } catch (e) {
        log("INFO", "Подпись не удалась", e)
        return false
    };
}

function createToken(data){
    return data.login + '.' + handshake(data.login);
}

function isTooBig(data){
    return (data.length > 20) ? true : false;
}

function accessText(text) {
    return text
        .replace(/[<>]/gim, function (i) {
            return (i.charCodeAt(0) == 60) ? '&lt;' : '&gt;';
        })
}

function isSpaced(message){
    return (message.replace(/ /g,"").length < 1) ? true : false;
}

function isEmpty(data){
    return (data == undefined || data.length < 1) ? true : false;
}

function handshake(username) {
    return SHA512(username + SHA512(CONFIG.secret));
}

module.exports = {
    deleteConversation: deleteConversation,
    deleteUser: deleteUser,
    addConversation: addConversation,
    deleteMessage: deleteMessage,
    register: register,
    login: login,
    message: message,
    getUsers: getUsers,
    changeRoom: changeRoom,
    loadRoom: loadRoom,
    checkUser : checkUser
}

function message(data, callback) {
    let name;

    (!data.message || isSpaced(data.message)) ? callback({success: false, info: "Ошибка. Пустой текст."}) :
        (!data.room) ? callback({success: false, info: "Ошибка. Не выбран диалог."}) :
            (!data.sendFrom) ? callback({success: false, info: "Ошибка. Не выбран отправитель."}) :
                (data.message.length == 0) ? callback({success: false, info: "Ошибка. Пустое сообщение."}) :
                    (!checkUser(data.sendFrom)) ? callback({success: false, info: "Ошибка подписи отправителя. "}) :
                        name = checkUser(data.sendFrom);
    if(!name) return;
    let room = data.room,
        backData = {},
        message = normaMessage(data.message);

    checkURL(room, message, name)
        .then( result => {
            if (!isEmpty(result.path))
                backData.image = {id: result.id, sendFrom: name,
                    imgpath: result.path,
                    date: result.date
            };
            return DB.addMessage(name, room, accessText(message))
        }).then( result => {

            backData.message = {
                sendFrom: name,
                message: accessText(message),
                date: result[0].date,
                id: result[0].idmessage
            };
            callback({success: true, backData, info: "Успешно."});
        }).catch(error => {;
            log("WARN", "Ошибка при добавлении сообщения", error);
            callback({ success: false, backData, info: "Server-side error"});
        });
}

function login(data, callback) {
    let token;
    (isEmpty(data.password)) ? callback({success: false, name: null, info: "Пустой пароль"}) :
        (isEmpty(data.login)) ? callback({success: false, name: null, info: "Пустой логин"}) :
            (isTooBig(data.password)) ? callback({success: false, name: null, info: "Слишком большой пароль"}) :
                (isTooBig(data.login)) ? callback({success: false, name: null, info: "Слишком большой логин"}) :
        DB.authorization(data.login, data.password)
            .then(auth => {
                if (auth != 1) callback({success: false, name: null, info: "Неверный логин/пароль"})
                else {
                    token = createToken(data);
                    return DB.loadRoom(data.login)
                };
            }).catch(error => {
                log("WARN", "Ошибка при авторизации1", error);
                callback({success: false, name: null, info : "Server-side error"});
            }).then(result => {
                let rooms = (isEmpty(result) || isEmpty(result.rooms)) ? [] : result.rooms;
                callback({rooms: rooms, login: data.login, success: true, token: token});
            }).catch(error => {
                log("WARN", "Ошибка при авторизации2", error);
                callback({success: false, name: null, info : "Server-side error"});
            })
}

function register(data, callback) {
    let token;
    (isEmpty(data.password)) ? callback({success: false, name: null, info: "Пустой пароль"}) :
        (isEmpty(data.login)) ? callback({success: false, name: null, info: "Пустой логин"}) :
            (isEmpty(data.firstName)) ? callback({success: false, name: null, info: "Пустое имя"}) :
                (isEmpty(data.lastName)) ? callback({success: false, name: null, info: "Пустая фамилия"}) :
                    (isTooBig(data.password)) ? callback({success: false, name: null, info: "Слишком большой пароль"}) :
                        (isTooBig(data.login)) ? callback({success: false, name: null, info: "Слишком большой логин"}) :
                            (isTooBig(data.firstName)) ? callback({success: false, name: null, info: "Слишком большое имя"}) :
                                (isTooBig(data.lastName)) ? callback({success: false, name: null, info: "Слишком большая фамилия"}) :
        DB.register(data.login, data.password, data.firstName, data.lastName)
            .then(result => {
                if (!result) callback({success: false, info: "Пользователь уже существует"})
                else {
                    token = createToken(data);
                    callback({login: data.login, success: true, token: token, info: "Пользователь создан"});
                }
            }).catch(error => {
                log("WARN", "Registration error", error);
                callback({success : false, info: "Server-side error"});
            })
}

function deleteMessage(data, callback) {
    DB.deleteMessage(data.idmessage, data.idroom)
        .then(result => {
        socket.broadcast.to(data.idroom).emit('delete', {id: data.idmessage, room: data.idroom});
    callback(result);
}).catch(error => {
        log("WARN", "Ошибка при удалении сообщения", error);
        callback({success: false, info: "Server-side error"});
})
}

function addConversation(data, callback) {
    let login,
        users;
    (!data.name) ? callback({success: false, info: "Не выбрано название"}) :
        (!data.users) ? callback({success: false, info: "Не выбраны пользователи"}) :
            (!checkUser(data.token)) ? callback({success: false, info: "Пользователь не подписан"}) :
                login = checkUser(data.token);
    if(!login) return;

    (typeof(data.users) == "string") ? users = data.users.split(",") : users = data.users;
    DB.addConversation(users, data.name)
        .then(result => {
            return DB.loadRoom(login)
        }).catch(error => {
            callback({success: false, info: "Server-side error"});
            log("WARN", "Ошибка при добавлении нового диалога", error);
        }).then(result => {
            callback({success: true, room_id: result.rooms.id})
        }).catch(error => {
            callback({success: false, info: "Server-side error"});
            log("WARN", "Ошибка при загрузке комнаты", [users, data.name, error]);
        });
}

function deleteUser(username, callback) {
    DB.deleteUser(username)
        .then(result => {
            callback(true);
        }).catch(error => {
            log("WARN", "Ошибка при удалении пользователя", error);
            callback(false);
        })
};

function deleteConversation(room, callback) {
    DB.deleteConversation(room)
        .then(result => {
            callback({success: true});
        }).catch(error => {
            log("WARN", "Ошибка при удалении комнаты", error);
            callback({success: false});
        })
};

function getUsers(username, callback) {
    DB.getUsers(checkUser(username))
        .then(result => {
            callback(result);
        }).catch(error => {
            log("WARN", "Ошибка при загрузке юзеров", error);
            callback(error);
        });
};

function changeRoom(data, callback) {
    (!data.room) ? callback({success: false, rows: false, info: "Не выбрана комната"}) :
        (!data.limit) ? callback({success: false, rows: false, info: "Не выбран лимит загрузки сообщений"}) :
            DB.loadMessage(data.room, data.limit)
                .then(result => {
                    callback({success: true, messages: result, info: "История загружена успешно."});
                }).catch(error => {
                    callback({success: false, info: "Server-side error"});
                    log("WARN", "Ошибка при загрузке сообщений", error);
                });
}

function loadRoom(login, callback) {
    (!checkUser(login)) ? callback({success: false, info: "Ошибка подписи при загрузке диалогов"}) :
        DB.loadRoom(checkUser(login))
            .then(result => {
                callback({success: true, room: result});
            }).catch(error => {
                callback({success: false, info: "Server-side error"});
                log("WARN", "Ошибка при загрузке диалогов", error);
            })
}


