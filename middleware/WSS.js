const LOGIN = require('../routes/login'),
    REG = require('../routes/register'),
    CHAT = require('./CHATcore');

module.exports = function (httpServer, SSLserver) {
    let io = require('socket.io').listen(httpServer)/*.listen(SSLserver)*/;

    io.on('connection', function (socket) {
        socket.on('login', function (data, callback) {
            CHAT.login(data, function (confirm) {
                if (!confirm.result) {
                    LOGIN.f(false, null);
                    callback(confirm);
                } else {
                    callback(confirm);
                    LOGIN.f(true, confirm.login);
                    LOGIN.addRooms(confirm.rooms);
                }
            });
        });

        socket.on('register', function (data, callback) {
            CHAT.register(data, function (confirm) {
                callback(confirm);
                if (confirm.result) {
                    LOGIN.f(confirm.result, confirm.login);
                    REG.f(confirm.result, confirm.login);
                }
                ;
            });
        });

        socket.on('message', function (data, callback) {
            CHAT.message(data, function (message) {
                if (message.result) socket.broadcast.to(data.room).emit('NEW', message.backData);
                callback(message);
            });
        });

        socket.on('deleteMessage', function (data, callback) {
            CHAT.deleteMessage(data, function (result) {
                callback(result);
            });
        });

        socket.on('addConversation', function (data, callback) {
            CHAT.addConversation(data, function (result) {
                callback(result);
            });
        });

        socket.on('showFriends', function (username) { //загрузка всех юзеров, в дальнейшем надо отключить
            CHAT.showFriendList(username, function (result) {
                socket.emit('users', {rows: result});
            });
        });

        socket.on('deleteUser', function (username, callback) {
            CHAT.deleteUser(username, function (result) {
                callback(result);
            });
        });

        socket.on('deleteConversation', function (room, callback) {
            CHAT.deleteConversation(room, function (result) {
                callback(result);
            });
        });

        socket.on('changeRoom', function (data, callback) {
            CHAT.changeRoom(data, (result) => {
                if (result.result) socket.join(data.room);
                callback(result);
            })
        });

        socket.on('loadRoom', function (login, callback) {
            CHAT.loadRoom(login, (result) => {
                if (result.result) socket.emit('loadRoom', result[0]);
                callback(result);
            });
        });
    });

};

