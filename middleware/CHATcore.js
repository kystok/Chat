let log = require('./logger').log,
    config = require('../config'),
    sha512 = require('js-sha512'),
    download = require('image-downloader'),
    path = require('path'),
    db = require('./DBcore');


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
            pathImg = `/images/${name}.${type}`,
            options = {
                url: url,
                dest: path.join(__dirname, "../public/" + pathImg )
            };

        download.image(options)
            .then(({filename, image}) => {
                return db.addImage(room, sendFrom, pathImg)
            }).catch((err) => {
                log("image-downloader", "Ошибка при загрузке изображения", err);
                reject(false);
            }).then(result => {
                let idmes = result[0].idmessage,
                date = result[0].date;
                resolve({idmes, date, pathImg})
            }).catch((err) => {
                log("DBcore", "Ошибка при загрузе изображения", err);
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
        log("WSS error", "Подпись не удалась", e)
        return false
    };
}

function isReadyForReg(data){
    return (data.login == undefined || data.login.length < 1 || data.login.length > 20) ? false :
        (data.pass == undefined || data.pass.length < 1 || data.pass.length > 20) ? false :
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

function isSpaced(message){
    return (message.replace(/ /g,"").length < 1) ? true : false;
}

function isEmpty(data){
    return (data == undefined || data.length < 1) ? true : false;
}

function handshake(username) {
    return sha512(username + sha512(config.secret));
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
    loadRoom: loadRoom
}

function message(data, callback) {
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
                backData.image = {id: result.id, sendFrom: name,
                    imgpath: result.path,
                    date: result.date
            };
            return db.addMessage(name, room, accessText(message))
        }).then( result => {

            backData.message = {
                sendFrom: name,
                message: accessText(message),
                date: result[0].date,
                id: result[0].idmessage
            };
            callback({result: true, backData, info: "Успешно."});
        }).catch(error => {
            log("DBcore", "Ошибка при добавлении сообщения", error);
            callback({ result: false, backData, info: "Server-side error"});
        });
}

function login(data, callback) {
    console.log(data);
    (data.login.length > 20) ? callback({result: false, name: null, info : "Слишком длинный логин"}) :
        db.authorization(data.login, data.password)
            .then(auth => {
                if (auth != 1) callback({result: false, name: null, info: "wrong login/password"});
                let name = data.login + '.' + handshake(data.login);
                callback({login: data.login, result: true, name: name});
            }).catch(error => {
                log("DBcore", "Ошибка при авторизации", error);
                callback({result: false, name: null, info : "Server-side error"});
            });
}

function register(data, callback) {
    (!isReadyForReg(data)) ? callback({result: false, info: "Недопустимое количество символов"}) :
        db.register(data.login, data.pass, data.firstName, data.lastName)
            .then(result => {
                if (!result) callback({result: false, info: "Пользователь уже существует"});
                let userCookie = data.login + '.' + handshake(data.login);
                callback({login: data.login, result: true, username: userCookie, info: "Пользователь создан"});
            }).catch(error => {
                log("DBcore", "Registration error", error);
                callback({result : false, info: "Server-side error"});
            });
}

function deleteMessage(data, callback) {
    db.deleteMessage(data.idmessage, data.idroom)
        .then(result => {
        socket.broadcast.to(data.idroom).emit('delete', {id: data.idmessage, room: data.idroom});
    callback(result);
}).catch(error => {
        log("DBcore", "Ошибка при удалении сообщения", error);
    callback({result: false, info: "Server-side error"});
})
}

function addConversation(data, callback) {
    (!data.name) ? callback({result: false, info: "Ошибка. Не выбрано название"}) :
        (!data.users) ? callback({result: false, info: "Ошибка. Не выбраны пользователи"}) :
            (!checkUser(data.sendFrom)) ? callback({result: false, info: "Ошибка. Пользователь не подписан"}) : "";
    let sendFrom = checkUser(data.sendFrom),
        users;
    (typeof(data.users) == "string") ? users = data.users.split(",") : users = data.users;
    db.addConversation(users, data.name)
        .then(result => {
            return db.loadRoom(sendFrom)
        }).catch(error => {
            callback({result: false, info: "Server-side error"});
            log("DBcore", "Ошибка при добавлении нового диалога", [users, data.name, error]);
        }).then(result => {
            result.result = true;
            callback(result)
        }).catch(error => {
            callback({result: false, info: "Server-side error"});
            log("DBcore", "Ошибка при загрузке комнаты", [users, data.name, error]);
        });
}

function deleteUser(username, callback) {
    db.deleteUser(username)
        .then(result => {
            callback(true);
        }).catch(error => {
            log("DBcore", "Ошибка при удалении пользователя", error);
            callback(false);
        })
};

function deleteConversation(room, callback) {
    db.deleteConversation(room)
        .then(result => {
            callback({result: true});
        }).catch(error => {
            log("DBcore", "Ошибка при удалении комнаты", error);
            callback({result: false});
        })
};

function getUsers(username, callback) {
    db.getUsers(checkUser(username))
        .then(result => {
            callback(result);
        }).catch(error => {
            log("DBcore", "Ошибка при загрузке юзеров", error);
            callback(error);
        });
};

function changeRoom(data, callback) {
    (!data.room) ? callback({result: false, rows: false, info: "Ошибка. Не выбрана комната"}) :
        (!data.limit) ? callback({result: false, rows: false, info: "Ошибка. Не выбран лимит"}) :

    db.loadMessage(data.room, data.limit)
        .then(result => {
            callback({result: true, rows: result, info: "История загружена успешно."});
        }).catch(error => {
            callback({result: false, rows: false, info: "Ошибка. Что-то пошло не так"});
            log("DBcore", "Ошибка при загрузке сообщений", error);
        });
}

function loadRoom(login, callback) {
    db.loadRoom(checkUser(login))
        .then(result => {
           callback({result: true, room: result});
        }).catch(error => {
            callback({result: false, info: "Ошибка при загрузке диалогов"});
            log("DBcore", "Ошибка при загрузке диалогов", error);
        })
}


