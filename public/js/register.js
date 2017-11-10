function reg() {
    var firstName = $("input[name='firstname']").val();
    var lastName = $("input[name='lastname']").val();
    var login = $("input[name='login']").val();
    var pass = $("input[name='password']").val();

    _reg(firstName, lastName, login, pass, function (data) {
        if (data.result) {
            document.cookie = `username = ${data.username}`;
            location.reload();
        }
    });
}

function _reg(firstName, lastName, login, pass, callback) {
    socket.emit('register', {login: login, password: pass, lastName: lastName, firstName: firstName},
        function (data) {
        callback(data);
    });
}

function _delUsr(login, callback) {
    socket.emit('deleteUser', login,
        function (data) {
            callback(data);
        });
}

function _delConv(room, callback) {
    socket.emit('deleteConversation', room,
        function (data) {
            callback(data);
        });
}
