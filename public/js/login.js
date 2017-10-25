//var socket = io.connect('http://localhost:3000');

function login() {
    socket.emit('login', { login: $("input[name='username']").val(), password: $("input[name='password']").val()},
        function(callback) {
            document.cookie = `username = ${callback}`;
            location.reload();
        });
}