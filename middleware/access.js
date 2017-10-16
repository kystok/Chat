/*const sha512 = require('js-sha512');
//var mysql = require('mysql');
const config = require('../config');
var connection = mysql.createConnection({
    host: config.db.clients.host,
    port: config.db.clients.port,
    user: config.db.clients.user,
    password: config.db.clients.password,
    database: config.db.clients.database
});

connection.connect();



function authorization(login, password) {
    return new Promise(function(resolve, reject) {
        var sql = `SELECT \`authUsers\`('${login}', '${hash(login, password)}') AS \`result\`;`;
        connection.query(sql, function(err, rows, fields) {
            var auth = false;
            if (err) { console.log('error in query: ', sql) };
            if (rows[0].result == 1) {
                auth = true;

            } else {
                console.log('не получилось войти ', rows[0].result);
            };
            resolve(auth);
        });
    });

}

function hash(login, pass) {
    return hash_password = sha512(pass + sha512(login));
}

module.exports = {
    authorization: authorization,
    hash: hash
}*/