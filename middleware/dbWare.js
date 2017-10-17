const sha512 = require('js-sha512');
const log = require('../routes/login');
var mysql = require('mysql');
const config = require('../config');
var options = {
    host: config.db.clients.host,
    port: config.db.clients.port,
    user: config.db.clients.user,
    password: config.db.clients.password,
    database: config.db.clients.database
}
var pool = mysql.createPool(options);


function query(sql, params, callback) {
    pool.getConnection(function(error, connection) {
        connection.query(sql, params, function(err, rows) {
            connection.release();
            callback({ err, rows });
        })
    })
}


function authorization(login, password) {
    return new Promise(function(resolve, reject) {
        var sql = 'SELECT `authUsers`(?, ?) AS `result`;';
        query(sql, [login, hash(login, password)], function(callback) {

            var auth = false;
            if (callback.err) { console.log('error in query: ', callback.err) };
            if (callback.rows[0].result == 1) {
                auth = true;

            } else {
                console.log('не получилось войти ', callback.rows[0].result);
            };
            resolve(auth);
        });
    });

}

function hash(login, pass) {
    return hash_password = sha512(pass + sha512(login));
}


function addMessage(sendFrom, id_room, text) {
    return new Promise(function(resolve, reject) {
        var sql = "CALL `addMessages` (?,?,?)";
        query(sql, [sendFrom, id_room, text], function(callback) {
            resolve(callback.rows[0]);
        })
    });
};


function addImage(room, sendFrom, path) {
    return new Promise(function(resolve, reject) {
        var sql = "CALL `addImage` (?,?,?)"
        query(sql, [room, path, sendFrom], function(callback) {
            resolve(callback.rows[0]);
        })
    });
};

function loadRoom(login) {
    return new Promise(function(resolve, reject) {
        var sql = 'CALL `showRoom`(?);';
        query(sql, login, function(callback) {
            resolve(callback.rows[0]);
        });
    });
};

function loadUsers(user) {
    return new Promise(function(resolve, reject) {
        var sql = 'SELECT `login` FROM `users` WHERE `login` != ?';
        query(sql, user, function(callback) {
            resolve(callback.rows[0]);
        });
    });
};


function loadMessage(room) {
    return new Promise(function(resolve, reject) {
        var sql = "CALL `loadMessage` (?)";
        query(sql, room, function(callback) {
            resolve(callback.rows[0]);
        });
    });
};


function register(login, pass, fn, ln) {
    return new Promise(function(resolve, reject) {
        var sql = 'SELECT `addUser`(?,?,?,?) AS `result`;';
        query(sql, [login, hash(login, pass), fn, ln], function(callback) {
            resolve(callback.rows[0]);
        });
    });
};

function addFile(room, sendFrom, path, name) {
    return new Promise(function(resolve, reject) {
        var sql = "CALL `addFile` (?,?,?,?)"
        query(sql, [room, path, sendFrom, name], function(callback) {
            resolve(callback.rows[0]);
        });
    })
}


function getUsers(userName) {
    return new Promise(function(resolve, reject) {
        var sql = 'CALL `getUsers`(?)';
        query(sql, [userName], function(callback) {
            resolve(callback.rows[0]);
        });
    });
}

function addConversation(users, name) {
    return new Promise(function(resolve, reject) {
        var sql = 'CALL `addConversation`(?,?)';
        for (var i = 0; i < users.length; i++)
            query(sql, [name, users[i]], function(callback) {});
        resolve('Done');
    })
}

function deleteMessage(id, room) {
    return new Promise(function(resolve, reject) {
        var sql = 'DELETE FROM `messages` WHERE `id`=? AND `id_room`=?';
        query(sql, [id, room], function(callback) {
            resolve(callback.rows[0]);
        });
    })
}

module.exports = {
    addMessage: addMessage,
    loadRoom: loadRoom,
    loadUsers: loadUsers,
    loadMessage: loadMessage,
    register: register,
    addFile: addFile,
    addImage: addImage,
    getUsers: getUsers,
    deleteMessage: deleteMessage,
    addConversation: addConversation,
    authorization: authorization
}