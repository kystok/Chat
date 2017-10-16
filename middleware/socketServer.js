var db = require('./dbWare');
var access = require('../middleware/access');
var render = require('../routes/render');
const log = require('../routes/login');
const reg = require('../routes/register');
const config = require('../config');
const sha512 = require('js-sha512');
var path = require('path');
var multiparty = require('multiparty');
var users = [];
const download = require('image-downloader');
var multiparty = require('multiparty');
var fs = require("fs");


module.exports = function(server) {

    var io = require('socket.io')(server);
    var form = new multiparty.Form();
    io.sockets.on('connection', function(socket) {

        socket.on('login', function(data) {

            db.authorization(data.login, data.password)
                .then(result => {
                    if (result) {
                        var uc = data.login + '.' + handshake(data.login);
                        socket.emit('login', { usercookie: uc });
                    };
                    return log.f(result, data.login);
                });
        });


        socket.on('message', function(data, callback) {
            var name = data.sendFrom.substring(0, data.sendFrom.indexOf("."));
            var room = data.room;
            var onlySpace = true;
            var backData = {}
            var message = "";
            if (checkUser(data.sendFrom)) {
                checkURL(data.room, normaMessage(data.message), name)
                    .then(result => {
                        var path = result.path;
                        var id = result.id;
                        var date = result.date;
                        message = normaMessage(result.message);
                        if (path != undefined) {
                            backData.image = {
                                id: id,
                                sendFrom: name,
                                img_path: path,
                                date: date
                            };
                            console.log('bd',backData)
                            socket.emit('backImage', { sendFrom: name, img_path: path, date: new Date() });
                        }
                        if (message.length != 0)
                            for (var i = 0; i < message.length; i++)
                                if (message[i].charCodeAt() != 32) {
                                    onlySpace = false;
                                    break;
                                }
                        if (!onlySpace) {
                            db.addMessage(name, room, message)
                                .then(result => {
                                    backData.message = {
                                        sendFrom: name,
                                        message: accessText(message),
                                        date: result[0].date,
                                        id: result[0].id_message
                                    };
                                    callback(backData);
                                })
                                .catch(error => {
                                    console.log("error promise: ", error);
                                })
                        } else callback(backData);
                    })
                    .catch(err => {
                        message = normaMessage(err.message);
                        db.addMessage(name, room, message)
                            .then(result => {
                                backData.message = {
                                        sendFrom: name,
                                        message: accessText(message),
                                        date: result[0].date,
                                        id: result[0].id_message
                                    };
                                callback(backData);
                            })
                            .catch(error => {
                                console.log("error promise: ", error);
                            })
                    })

            };

        });


        socket.on('deleteMessage', function(data, callback) {
            db.deleteMessage(data.id_message, data.id_room)
                .then(result => {
                    callback(result);
                })
        })

        socket.on('addConversation', function(data) {
            db.addConversation(data.users, data.name)
                .then(result => {
                    db.loadRoom(data.sendFrom)
                        .then(result => {
                            socket.emit('loadRoom', result);
                        });
                })
        })

        socket.on('users', function(username) {
            db.getUsers(username)
                .then(result => {
                    socket.emit('users', { rows: result });
                })
        })


        socket.on('uploadFile', function(data, callback) {
            var username = data.sendFrom.substring(0, data.sendFrom.indexOf("."));
            db.addFile(data.room, username, data.path.substring(data.path.indexOf("/")), data.name)
                .then(result => {
                    var path = data.path.substring(data.path.indexOf("/"));
                    var name = data.name
                    callback(path);
                })
        });




        socket.on('changeRoom', function(data) {
            socket.join(data.room);

            db.loadMessage(data.room)
                .then(result => {
                    socket.emit('loadConversation', { rows: result });
                });
        });

        socket.on('register', function(data) {
            db.register(data.login, data.pass, data.firstName, data.lastName)
                .then(result => {
                    socket.emit('register', {});
                    log.f(result, data.login);
                    return reg.f(result, data.login);
                })
                .catch(error => {
                    console.log("error promise registration: ", error);
                })
        });

        socket.on('loadRoom', function(login) {
            db.loadRoom(login)
                .then(result => {
                    socket.emit('loadRoom', result);
                })
                .catch(error => {
                    console.log("error promise loadRoom: ", error);
                })
        });


    });

    function normaMessage(text) {
        var result = text;
        var col = true;
        while (col) {
            result = result.replace(/\u0020+/, " ");
            result = result.replace(/\u0009+/, " ");
            result = result.replace(/\u000A+/m, '\n');
            if (result.match(/(&nbsp;){1,}/m) == null && result.match(/(<br>){1,}/m) == null) { col = false; }
        }

        return result.replace(/\xa0/gim, ' ').replace(/([\u0020]*$)/gim, '').replace(/(^[\u0020]+)/gim, '');;
    }

    function downloadImage(url, type, sendFrom, room) {
        return new Promise(function(resolve, reject) {
            var t = new Date();
            var name = sha512(url + sha512(t + ""));
            var pathh = `/images/${name}.${type}`;
            var options = {
                url: url,
                dest: path.join(__dirname, "../public" + pathh)
            }

            download.image(options)
                .then(({ filename, image }) => {
                    db.addImage(room, sendFrom, pathh)
                        .then(result => {
                            var id_mes = result[0].id_message;
                            var date = result[0].date;
                            resolve({id_mes, date, pathh});
                        })
                })
                .catch((err) => {
                    console.log('errDWNLD ', err);
                    console.log('opt ', options);
                    reject(null);
                })
        })
    }


    function checkURL(room, message, sendFrom) {
        return new Promise(function(resolve, reject) {
            var mes = message;
            var res = true;
            var ret = {};
            var i = 0;
            while (res) {
                try {
                    var url = mes.match(/((http(s)?)|(www\.))([^\.]+)\.([^\s]+(jpg|png))/)[0];
                    var type = mes.match(/((http(s)?)|(www\.))([^\.]+)\.([^\s]+(jpg|png))/)[7];
                    i++;
                } catch (e) {
                    var url = null;
                    res = false;
                }
                mes = mes.replace(url, '');
                if (url != null) {
                    downloadImage(url, type, sendFrom, room)
                        .then(result => {
                            ret.path = result.pathh;
                            ret.id = result.id_mes;
                            ret.date = result.date;
                            console.log('result in down: ', ret)
                            resolve(ret);
                        })
                        .catch(err => {
                            console.log('error in down: ', ret)
                            ret.message = message;
                            reject(ret);
                        });
                } else {
                    if (i == 0)
                        resolve(ret);
                }
            }
            ret.message = mes;
        })
    }


    function handshake(username) {
        return sha512(username + sha512(config.secret));
    }

    function checkUser(text) {
        var u1 = text.substring(text.indexOf(".") + 1);
        var u2 = handshake(text.substring(0, text.indexOf(".")));
        if (u1 == u2)
            return true;
        else
            return false;
    }

    /*function accessText(text) {

        return text
        //  хотя лучше оставить это, что бы проверка была на сервере, а не на клиенте..
        //.replace(/[\u0000-\u9999<>\&]/gim, function(i) { //Из-за DIV вроде инпута не нужно экранировать, 
        // див сам экранирует <> эти тэги
        //console.log('&#' + i.charCodeAt(0) + ';')
        //    return '&#' + i.charCodeAt(0) + ';';
        //});
    }*/


    function clear_nbsp(text) {
        return text.replace(/\xa0/gim, ' ');
    }

    function clear_code_32(text) {
        return text.replace(/\xa0/gim, ' ').replace(/([\u0020]*$)/gim, '').replace(/(^[\u0020]+)/gim, '');
    }

    function accessText(text) {
        return text
            .replace(/[<,>]/gim, function(i) {
                console.log(i.charCodeAt(0))
                if (i.charCodeAt(0) == 60)
                    return '&lt;'
                else
                    return '&gt;'
            })
    }


}