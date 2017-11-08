const log = require('./logger').log,
    CONFIG = require('../config'),
    SHA512 = require('js-sha512'),
    DOWNLOAD = require('image-downloader'),
    PATH = require('path'),
    DB = require('./DBcore');

module.exports = {
    normaMessage: normaMessage,
    downloadImage: downloadImage,
    checkUser: checkUser,
    isReadyForLog: isReadyForLog,
    isReadyForReg: isReadyForReg,
    accessText: accessText,
    isSpaced: isSpaced,
    isEmpty: isEmpty,
    handshake: handshake,
    addFriends: addFriends,

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
};

function addFriends(data) {
    return new Promise((resolve, reject) => {
        (!checkUser(data.sendFrom)) ? resolve({result: false, info: "Ошибка подписи."}) :
            DB.addFriend(checkUser(data.sendFrom), data.friend)
                .then(result => {
                    resolve(result[0]);
                });
    });
}

function normaMessage(text) {
    return text
        .replace(/\u0020+/gim, " ")
        .replace(/\u0009+/gim, " ")
        .replace(/\u000A+/gim, '\n')
        .replace(/\xa0/gim, ' ')
        .replace(/([\u0020]*$)/gim, '')
        .replace(/(^[\u0020]+)/gim, '');
}

function downloadImage(url, type) {
    return new Promise(function (resolve, reject) {
        let date = Date.parse(new Date) + new Date().getMilliseconds(),
            name = SHA512(url + SHA512(date + "")),
            pathImg = `/images/${name}.${type}`,
            options = {
                url: url,
                dest: PATH.join(__dirname, "../public/" + pathImg)
            };

        DOWNLOAD.image(options)
            .then(({filename, image}) => {
                resolve({pathImg});
            }).catch((err) => {
            log("image-downloader", "Ошибка при загрузке изображения", err);
            reject(err);
        });
    });
}

function checkURL(room, message, sendFrom) {
    return new Promise((resolve, reject) => {
        let path;
        let match = message.match(/((http(s)?)|(www\.))([^\.]+)\.([^\s]+(jpg|png))/);
        if (!match) {
            resolve({message: message})
        } else {
            message = message.replace(match[7], "");
            downloadImage(match[0], match[7])
                .then(result => {
                    path = result.pathImg
                    return DB.addImage(room, sendFrom, result.pathImg)
                }).catch(error => {
                log("image-downloader", "Ошибка при загрузке изображения", error);
                resolve({message: message});
            }).then(result => {
                let ret = {
                    path: path,
                    id: result[0].id_message,
                    date: result[0].date,
                    message: message
                };
                resolve(ret)
            }).catch((err) => {
                log("image-downloader", "Ошибка при загрузке изображения", error);
                resolve({message: message});
            });
        }

    });
}

function checkUser(text) {
    try {
        return (text.substring(text.indexOf(".") + 1) != handshake(text.substring(0, text.indexOf("."))) ) ? false :
            text.substring(0, text.indexOf("."));
    } catch (e) {
        log("WSS error", "Подпись не удалась", e)
        return false
    }
}

function isReadyForLog(data) {
    return (data.login == undefined || data.login.length < 1 || data.login.length > 20) ? false :
        (data.password == undefined || data.password.length < 1 || data.password.length > 20) ? false :
            true;
}

function isReadyForReg(data) {
    return (!isReadyForLog(data)) ? false :
        (data.firstName == undefined || data.firstName.length < 1 || data.firstName.length > 20) ? false :
            (data.lastName == undefined || data.lastName.length < 1 || data.lastName.length > 20) ? false :
                true;
}

function accessText(text) {
    return text
        .replace(/[<>]/gim, function (i) {
            return (i.charCodeAt(0) == 60) ? '&lt;' : '&gt;';
        })
}

function isSpaced(message) {
    return (message.replace(/ /g, "").length < 1) ? true : false;
}

function isEmpty(data) {
    return (data == undefined || data.length < 1) ? true : false;
}

function handshake(username) {
    return SHA512(username + SHA512(CONFIG.secret));
}


function message(data, callback) {
    let name;
    (!data.message || isSpaced(data.message)) ? callback({result: false, info: "Ошибка. Пустой текст."}) :
        (!data.room) ? callback({result: false, info: "Ошибка. Не выбран диалог."}) :
            (!data.sendFrom) ? callback({result: false, info: "Ошибка. Не выбран отправитель."}) :
                (data.message.length == 0) ? callback({result: false, info: "Ошибка. Пустое сообщение."}) :
                    (!checkUser(data.sendFrom)) ? callback({result: false, info: "Ошибка подписи отправителя. "}) :
                        name = checkUser(data.sendFrom);
    if (!name) return;
    let room = data.room,
        backData = {},
        message = normaMessage(data.message);

    checkURL(room, message, name)
        .then(result => {
            console.log('***', result)
            if (!isEmpty(result.path))
                backData.image = {
                    id: result.id, sendFrom: name,
                    imgpath: result.path,
                    date: result.date
                };
            return DB.addMessage(name, room, accessText(message))
        }).then(result => {
        console.log('---', result)
        backData.message = {
            sendFrom: name,
            message: accessText(message),
            date: result[0].date,
            id: result[0].idmessage
        };
        callback({result: true, backData, info: "Успешно."});
    }).catch(error => {
        ;
        log("WARN", "Ошибка при добавлении сообщения", error);
        callback({result: false, backData, info: "Server-side error"});
    });
}

function login(data, callback) {
    let name;
    (!isReadyForLog(data)) ? callback({result: false, info: "введены некорректные данные"}) :
        DB.authorization(data.login, data.password)
            .then(auth => {
                if (auth != 1) callback({result: false, name: null, info: "wrong login/password"})
                else {
                    name = data.login + '.' + handshake(data.login);
                    return DB.loadRoom(data.login)
                }
                ;
            }).catch(error => {
            log("WARN", "Ошибка при авторизации1", error);
            callback({result: false, name: null, info: "Server-side error"});
        }).then(result => {
            let rooms = (isEmpty(result) || isEmpty(result.rooms)) ? [] : result.rooms;
            callback({rooms: rooms, login: data.login, result: true, name: name});
        }).catch(error => {
            log("WARN", "Ошибка при авторизации2", error);
            callback({result: false, name: null, info: "Server-side error"});
        })
}

function register(data, callback) {
    let userCookie;
    (!isReadyForReg(data)) ? callback({result: false, info: "Недопустимое количество символов"}) :
        DB.register(data.login, data.password, data.firstName, data.lastName)
            .then(result => {
                if (!result) callback({result: false, info: "Пользователь уже существует"})
                else {
                    userCookie = data.login + '.' + handshake(data.login);
                    callback({login: data.login, result: true, username: userCookie, info: "Пользователь создан"});
                }
            }).catch(error => {
            log("WARN", "Registration error", error);
            callback({result: false, info: "Server-side error"});
        })
}

function deleteMessage(data, callback) {
    DB.deleteMessage(data.idmessage, data.idroom)
        .then(result => {
            socket.broadcast.to(data.idroom).emit('delete', {id: data.idmessage, room: data.idroom});
            callback(result);
        }).catch(error => {
        log("WARN", "Ошибка при удалении сообщения", error);
        callback({result: false, info: "Server-side error"});
    })
}

function addConversation(data, callback) {
    let sendFrom,
        users;
    (!data.name) ? callback({result: false, info: "Ошибка. Не выбрано название"}) :
        (!data.users) ? callback({result: false, info: "Ошибка. Не выбраны пользователи"}) :
            (!checkUser(data.sendFrom)) ? callback({result: false, info: "Ошибка. Пользователь не подписан"}) :
                sendFrom = checkUser(data.sendFrom);
    if (!sendFrom) return;

    (typeof(data.users) == "string") ? users = data.users.split(",") : users = data.users;
    DB.addConversation(users, data.name)
        .then(result => {
            return DB.loadRoom(sendFrom)
        }).catch(error => {
        callback({result: false, info: "Server-side error"});
        log("WARN", "Ошибка при добавлении нового диалога", error);
    }).then(result => {
        callback({result: true, id: result.rooms.id})
    }).catch(error => {
        callback({result: false, info: "Server-side error"});
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
            callback({result: true});
        }).catch(error => {
        log("WARN", "Ошибка при удалении комнаты", error);
        callback({result: false});
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
    (!data.room) ? callback({result: false, rows: false, info: "Ошибка. Не выбрана комната"}) :
        (!data.limit) ? callback({result: false, rows: false, info: "Ошибка. Не выбран лимит"}) :
            DB.loadMessage(data.room, data.limit)
                .then(result => {
                    callback({result: true, rows: result, info: "История загружена успешно."});
                }).catch(error => {
                callback({result: false, rows: false, info: "Ошибка. Что-то пошло не так"});
                log("WARN", "Ошибка при загрузке сообщений", error);
            });
}

function loadRoom(login, callback) {
    (!checkUser(login)) ? callback({result: false, info: "Ошибка подписи при загрузке диалогов"}) :
        DB.loadRoom(checkUser(login))
            .then(result => {
                callback({result: true, room: result});
            }).catch(error => {
            callback({result: false, info: "Ошибка при загрузке диалогов"});
            log("WARN", "Ошибка при загрузке диалогов", error);
        })
}


