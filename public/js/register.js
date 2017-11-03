function reg() {
    const firstName = $("input[name='firstname']").val(),
        lastName = $("input[name='lastname']").val(),
        login = $("input[name='login']").val(),
        pass = $("input[name='password']").val();
    _reg(firstName, lastName, login, pass,  (data) => {
        if (data.registration) {
            document.cookie = `username = ${data.username}`;
            location.reload();
        }

    });
}

function _reg(firstName, lastName, login, pass, callback) {
    socket.emit('register', {login, pass, lastName, firstName},
        (data) => {
            callback(data);
        });
}
