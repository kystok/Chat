function login() {
    var login = $("input[name='username']").val();
    var password = $("input[name='password']").val();
    _login(login, password, function (data) {
        if (data.result) {
            document.cookie = `username = ${data.name}`;
            location.reload();
        }
        else alert('Ошибка входа')
    })
}

function _login(login, password, callback) {
    socket.emit('login', {login, password},
        function (data) {
            callback(data);
        });
}