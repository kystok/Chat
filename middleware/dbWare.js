const sha512 = require('js-sha512'),
    path = require('path'),
    config = require('../config'),
    logger = require('./logger').logger(path.basename(__filename)),
    log = require('./logger').log,
    options = {
        host: config.db.clients.host,
        port: config.db.clients.port,
        user: config.db.clients.user,
        password: config.db.clients.password,
        database: config.db.clients.database
    };

var mysql = require('mysql'),
    pool = mysql.createPool(options);

function query(sql, params, callback) {
    try {
        pool.getConnection(function (error, connection) {
            connection.query(sql, params, function (error, rows) {
                connection.release();
                callback({error, rows});
            });
        });
    } catch (e) {
        log("DBcore", "MYSQL Connection failure", e);
    };
};

function authorization(login, password) {
    return new Promise(function (resolve, reject) {
        (login.length > 20) ? reject("Login is too big.") : "";
        var sql = 'SELECT `authUsers`(?, ?) AS `result`;';
        query(sql, [login, hash(login, password)], function (callback) {
            if (callback.error) {
                log("DBcore", "auth error", callback.error);
                reject(callback.error);
            };
            try {
                if (callback.rows[0].result == 1) {
                    console.log(callback.rows[0])
                    resolve(true);
                }
            } catch (e) {};
            reject("wrong login/password");
        });
    });
};

function hash(login, pass) {
    return sha512(pass + sha512(login));
};

function addAccess(login, session) {
    return new Promise(function (resolve, reject) {
        var sql = "CALL `access_mod`(?, ?)";
        query(sql, [login, session], function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows);
        });
    });
};

function access(session) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT `user` FROM `access` WHERE `session` = ? order by id DESC limit 1"
        query(sql, session, function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows);
        });
    });
};

function addMessage(sendFrom, id_room, text) {
    return new Promise(function (resolve, reject) {
        var sql = "CALL `addMessages` (?,?,?)";
        query(sql, [sendFrom, id_room, text], function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};


function addImage(room, sendFrom, path) {
    return new Promise(function (resolve, reject) {
        var sql = "CALL `addImage` (?,?,?)"
        query(sql, [room, path, sendFrom], function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};

function loadRoom(login) {
    return new Promise(function (resolve, reject) {
        var sql = 'CALL `showRoom`(?);';
        query(sql, login, function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};

function loadUsers(user) {
    return new Promise(function (resolve, reject) {
        var sql = 'SELECT `login` FROM `users` WHERE `login` != ?';
        query(sql, user, function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows);
        });
    });
};

function loadMessage(room, limit) {
    return new Promise(function (resolve, reject) {
        var sql = "CALL `loadMessage` (?,?)";
        query(sql, [room, limit], function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};

function register(login, pass, fn, ln) {
    return new Promise(function (resolve, reject) {
        var sql = 'SELECT `addUser`(?,?,?,?) AS `result`;';
        query(sql, [login, hash(login, pass), fn, ln], function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows[0].result);
        });
    });
};

function addFile(room, sendFrom, path, name) {
    return new Promise(function (resolve, reject) {
        var sql = "CALL `addFile` (?,?,?,?)"
        query(sql, [room, path, sendFrom, name], function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};


function getUsers(userName) {
    return new Promise(function (resolve, reject) {
        var sql = 'CALL `getUsers`(?)';
        query(sql, [userName], function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};

function addConversation(users, name) {
    return new Promise(function (resolve, reject) {
        var sql = "CALL `addConversation` (?,?)";
        for (var i = 0; i < users.length; i++) {
            query(sql, [name, users[i]], function (callback) {
                if (callback.error) reject(callback.error);
            });
        };
        resolve({result: true});
    });
};

function deleteMessage(id, room) {
    return new Promise(function (resolve, reject) {
        var sql = 'DELETE FROM `messages` WHERE `id`=? AND `id_room`=?';
        query(sql, [id, room], function (callback) {
            (callback.error) ? reject(callback.error) : resolve(callback.rows[0]);
        });
    });
};


function deleteUser(login) {
    return new Promise(function (resolve, reject) {
        var sql = 'DELETE FROM `users` WHERE `login`= ?';
        query(sql, login, function (callback) {
            (callback.error) ? reject(callback.error) : resolve("User " + login + "was deleted");
        });
    });
};

function deleteConversation(room) {
    return new Promise(function (resolve, reject) {
        var sql = 'DELETE FROM `rooms` WHERE `id`= ?';
        console.log(room);
        query(sql, room, function (callback) {
            (callback.error) ? reject(callback.error) : resolve("Room " + room + " was deleted");
        });
    });
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
}