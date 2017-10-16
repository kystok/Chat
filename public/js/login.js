var socket = io.connect('http://localhost:3000');


socket.on('login', function(data) {
    document.cookie = `username = ${data.usercookie}`;
    location.reload();
});

function login() {
    socket.emit('login', { login: $("input[name='username']").val(), password: $("input[name='password']").val(), socketId: socket.id });
}