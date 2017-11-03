const config = require('../config'),
    mysql = require('mysql'),
    path = require('path'),
    options = {
        host: config.db.clients.host,
        port: config.db.clients.port,
        user: config.db.clients.user,
        password: config.db.clients.password,
        database: config.db.clients.database
    },
    pool = mysql.createPool(options),
    sha512 = require('js-sha512'),
    logger = require('./logger').logger(path.basename(__filename)),
    log = require('./logger').log;


function query(sql, params, callback) {
    try {
        pool.getConnection((error, connection) => {
            connection.query(sql, params, (error, rows) => {
                connection.release();
                //console.log(sql, params)
                //console.log({error, rows})
                callback({error, rows});
            })
        })
    } catch (e) {
        log("ERROR", "Ошибка подключении к бд", e);
    }
}


function authorization(login, password) {
    return new Promise((resolve, reject) => {
        if (login !== "" || password !== "") {
            const sql = 'SELECT `authUsers`(?, ?) AS `result`;';
            query(sql, [login, hash(login, password)], (callback) => {
                let auth = false;
                if (callback.error) {
                    log("WARN", "авторизация", callback.error);
                    reject(callback.error);
                }
                if (callback.rows) {
                    if (callback.rows[0])
                        if (callback.rows[0].result === 1) {
                            auth = true;
                        }
                    if (callback.rows[0].result === 1) {
                        auth = true;
                    }
                } else auth = false;
                resolve(auth);
            });
        } else {
            resolve(false);
        }
    });
}

function hash(login, pass) {
    return sha512(pass + sha512(login));
}


function addAccess(login, session) {
    return new Promise((resolve, reject) => {
        const sql = "CALL `access_mod`(?, ?)";
        query(sql, [login, session], (callback) => {
            if (callback.error) {
                reject(callback.error);
            }
            if (callback.rows) {
                resolve(callback.rows);
            }
        })
    })
}


function access(session) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT `user` FROM `access` WHERE `session` = ? order by id DESC limit 1";
        query(sql, session, (callback) => {
            if (callback.error) {
                reject(callback.error);
            }
            if (callback.rows) {
                resolve(callback.rows);
            }
        })
    })
}

function addMessage(sendFrom, id_room, text) {
    return new Promise((resolve, reject) => {
        const sql = "CALL `addMessages` (?,?,?)";
        query(sql, [sendFrom, id_room, text], (callback) => {
            if (callback.rows) resolve(callback.rows[0]);
            if (callback.error) reject(callback.error);
        })
    });
}


function addImage(room, sendFrom, path) {
    return new Promise((resolve, reject) => {
        const sql = "CALL `addImage` (?,?,?)";
        query(sql, [room, path, sendFrom], (callback) => {
            if (callback.rows) resolve(callback.rows[0]);
            if (callback.error) reject(callback.error);
        })
    });
}

function loadRoom(login) {
    return new Promise((resolve, reject) => {
            const sql = 'CALL `showRoom`(?);';
            query(sql, login, (callback) => {
                if (callback.rows) resolve(callback.rows[0]);
                if (callback.error) reject(callback.error);
            });
        }
    )
}

function loadUsers(user) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT `login` FROM `users` WHERE `login` != ?';
        query(sql, user, (callback) => {
            if (callback.rows) resolve(callback.rows);
            if (callback.error) reject(callback.error);
        });
    });
};


function loadMessage(room, limit) {
    return new Promise((resolve, reject) => {
        const sql = "CALL `loadMessage` (?,?)";
        query(sql, [room, limit], (callback) => {
            if (callback.rows) resolve(callback.rows[0]);
            if (callback.error) reject(callback.error);
        });
    });
};


function register(login, pass, fn, ln) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT `addUser`(?,?,?,?) AS `result`;';
        query(sql, [login, hash(login, pass), fn, ln], (callback) => {
            if (callback.rows) resolve(callback.rows[0].result);
            if (callback.error) reject(callback.error);
        });
    });
};

function addFile(room, sendFrom, path, name) {
    return new Promise(function (resolve, reject) {
        const sql = "CALL `addFile` (?,?,?,?)";
        query(sql, [room, path, sendFrom, name], (callback) => {
            if (callback.rows) resolve(callback.rows[0]);
            if (callback.error) reject(callback.error);
        });
    })
}


function getUsers(userName) {
    return new Promise(function (resolve, reject) {
        const sql = 'CALL `getUsers`(?)';
        query(sql, [userName], function (callback) {
            if (callback.rows) resolve(callback.rows[0]);
            if (callback.error) reject(callback.error);
        });
    });
}

function addConversation(users, name) {
    return new Promise(function (resolve, reject) {
        const sql = "CALL `addConversation` (?,?)";
        let t = 0;
        for (let i = 0; i < users.length; i++) {
            query(sql, [name, users[i]], function (callback) {
                if (callback.error) reject(callback.error);
                t++;
                if (t === users.length) resolve('Done');
            });
        }
    })
}

function deleteMessage(id, room) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM `messages` WHERE `id`=? AND `id_room`=?';
        query(sql, [id, room], (callback) => {
            if (callback.rows) resolve(callback.rows[0]);
            if (callback.error) reject(callback.error);
        });
    })
}


module.exports = {
    addMessage: addMessage,
    loadRoom: loadRoom,
    loadUsers: loadUsers,
    loadMessage: loadMessage,
    register: register,
    access: access,
    addFile: addFile,
    addAccess: addAccess,
    addImage: addImage,
    getUsers: getUsers,
    deleteMessage: deleteMessage,
    addConversation: addConversation,
    authorization: authorization,
    query: query
};