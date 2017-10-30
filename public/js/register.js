function reg() {
    var firstName = $("input[name='firstname']").val();
    var lastName = $("input[name='lastname']").val();
    var login = $("input[name='login']").val();
    var pass = $("input[name='password']").val();
    _reg(firstName, lastName, login, pass, function (data) {
        if (data.registration) {
            document.cookie = `username = ${data.username}`;
            location.reload();
        }

    });
}

function _reg(firstName, lastName, login, pass, callback) {
    socket.emit('register', {login: login, pass: pass, lastName: lastName, firstName: firstName},
        function (data) {
        callback(data);
    });
}
