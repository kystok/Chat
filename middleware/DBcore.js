const MYSQL = require('mysql'),
    SHA512 = require('js-sha512'),
    CONFIG = require('../config'),
    path = require('path'),
    logger = require('./logger'),
    log = require('./logger').log,
    OPTIONS = {
        host: CONFIG.db.clients.host,
        port: CONFIG.db.clients.port,
        user: CONFIG.db.clients.user,
        password: CONFIG.db.clients.password,
        database: CONFIG.db.clients.database
    },
    POOL = MYSQL.createPool(OPTIONS);

function query(sql, params) {
    return new Promise((resolve, reject) => {
            POOL.getConnection(function (error, connection) {
                (error) ? resolve({error : error}) :
                    connection.query(sql, params, function (error, rows) {
                        connection.release();
                        resolve({error, rows});
                });
            })
    });
};

function hash(login, pass) {
    return SHA512(pass + SHA512(login));
};


module.exports = {
    addMessage: addMessage,
    loadRoom: loadRoom,
    loadUsers: loadUsers,
    loadMessage: loadMessage,
    register: register,
    addFile: addFile,
    access: access,
    addAccess: addAccess,
    addImage: addImage,
    getUsers: getUsers,
    deleteMessage: deleteMessage,
    addConversation: addConversation,
    authorization: authorization,
    deleteUser : deleteUser,
    deleteConversation: deleteConversation
};

function authorization(login, password) {
    return new Promise(function (resolve, reject) {
        let sql = 'SELECT `authUsers`(?, ?) AS `result`;';
        query(sql, [login, hash(login, password)])
            .then( callback => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows[0].result);
            });
    });
};

function addAccess(login, session) {
    return new Promise(function (resolve, reject) {
        let sql = "CALL `access_mod`(?, ?)";
        query(sql, [login, session])
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows);
        });
    });
};

function access(session) {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT `user` FROM `access` WHERE `session` = ? order by id DESC limit 1"
        query(sql, session)
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows);
        });
    });
};

function addMessage(sendFrom, id_room, text) {
    return new Promise(function (resolve, reject) {
        let sql = "CALL `addMessages` (?,?,?)";
        query(sql, [sendFrom, id_room, text])
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};


function addImage(room, sendFrom, path) {
    return new Promise(function (resolve, reject) {
        let sql = "CALL `addImage` (?,?,?)"
        query(sql, [room, path, sendFrom])
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};

function loadRoom(login) {
    return new Promise(function (resolve, reject) {
        let sql = 'CALL `showRoom`(?);';
        query(sql, login)
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve({result: true, rooms: callback.rows[0][0]});
        });
    });
};

function loadUsers(user) {
    return new Promise(function (resolve, reject) {
        let sql = 'SELECT `login` FROM `users` WHERE `login` != ?';
        query(sql, user)
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows);
        });
    });
};

function loadMessage(room, limit) {
    return new Promise(function (resolve, reject) {
        let sql = "CALL `loadMessage` (?,?)";
        query(sql, [room, limit])
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};

function register(login, pass, fn, ln) {
    return new Promise(function (resolve, reject) {
        let sql = 'SELECT `addUser`(?,?,?,?) AS `result`;';
        query(sql, [login, hash(login, pass), fn, ln])
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows[0].result);
        });
    });
};

function addFile(room, sendFrom, path, name) {
    return new Promise(function (resolve, reject) {
        let sql = "CALL `addFile` (?,?,?,?)"
        query(sql, [room, path, sendFrom, name])
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};


function getUsers(userName) {
    return new Promise(function (resolve, reject) {
        let sql = 'CALL `getUsers`(?)';
        query(sql, [userName])
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};

function addConversation(users, name) {
    return new Promise(function (resolve, reject) {
        let sql = "CALL `addConversation` (?,?)";
        for (let i = 0; i < users.length; i++) {
            query(sql, [name, users[i]])
                .then( (callback) => {
                    (callback.error) ? reject(callback.error) : resolve({result: true});;
                });
        };
    });
};

function deleteMessage(id, room) {
    return new Promise(function (resolve, reject) {
        let sql = 'DELETE FROM `messages` WHERE `id`=? AND `id_room`=?';
        query(sql, [id, room])
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};


function deleteUser(login) {
    return new Promise(function (resolve, reject) {
        let sql = 'DELETE FROM `users` WHERE `login`= ?';
        query(sql, login)
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve("User " + login + "was deleted");
        });
    });
};

function deleteConversation(room) {
    return new Promise(function (resolve, reject) {
        let sql = 'DELETE FROM `rooms` WHERE `id`= ?';
        query(sql, room)
            .then( (callback) => {
                (callback.error) ? reject(callback.error) : resolve("Room " + room + " was deleted");
        });
    });
};



