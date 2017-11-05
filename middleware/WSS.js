

const LOGIN = require('../routes/login'),
    REG = require('../routes/register'),
    chat = require('./CHATcore'),
    DB = require('./DBcore');

module.exports = function (httpServer, SSLserver) {
    let io = require('socket.io').listen(httpServer).listen(SSLserver);

    io.on('connection', function (socket) {

        socket.on('login', function (data, callback) {
            chat.login(data, function (confirm) {
                if (!confirm.result) {
                    LOGIN.f(false, null);
                    callback(confirm);
                };
                callback(confirm);
                LOGIN.f(true, confirm.login);
                LOGIN.addRooms(DB.loadRoom(confirm.login));
            });
        });

        socket.on('register', function (data, callback) {
            chat.register(data, function (confirm) {
                callback(confirm);
                LOGIN.f(confirm.result, confirm.login);
                REG.f(confirm.result, confirm.login);
                LOGIN.addRooms(DB.loadRoom(confirm.login));
            });
        });

        socket.on('message', function (data, callback) {
            chat.message(data, function (message) {
                if (message.result) socket.broadcast.to(data.room).emit('NEW', message.backData);
                callback(message);
            });
        });

        socket.on('deleteMessage', function (data, callback) {
            chat.deleteMessage(data, function (result) {
                callback(result);
            });
        });

        socket.on('addConversation', function (data, callback) {
            chat.addConversation(data, function (result) {
                callback(result);
            });
        });

        socket.on('users', function (username) { //загрузка всех юзеров, в дальнейшем надо отключить
            chat.getUsers(username, function (result) {
                socket.emit('users', {rows: result});
            });

        });

        socket.on('deleteUser', function (username, callback) {
            chat.deleteUser(username, function (result) {
                callback(result);
            });
        });

        socket.on('deleteConversation', function (room, callback) {
            chat.deleteConversation(room, function (result) {
                callback(result);
            });
        });

        socket.on('changeRoom', function (data, callback) {
            chat.changeRoom(data, (result) => {
            if (result.result) socket.join(data.room);
                callback(result);
            })
        });

        socket.on('loadRoom', function (login, callback) {
            chat.loadRoom(login, (result) => {
                if (result.result)  socket.emit('loadRoom', result.room);
                callback(resault);
            });
        });
    });
}

