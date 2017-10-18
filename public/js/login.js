//var socket = io.connect('http://localhost:3000');

function login() {
    socket.emit('login', { login: $("input[name='username']").val(), password: $("input[name='password']").val(), socketId: socket.id },
        function(callback) {
            document.cookie = `username = ${callback.usercookie}`;
            location.reload();
        });
}