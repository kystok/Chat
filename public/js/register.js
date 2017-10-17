var socket = io.connect('http://localhost:3000');

function reg() {
    var firstName = $("input[name='firstname']").val();
    var lastName = $("input[name='lastname']").val();
    var login = $("input[name='login']").val();
    var pass = $("input[name='password']").val();
    socket.emit('register', { login: login, pass: pass, lastName: lastName, firstName: firstName }, function(callback) {
        if (callback.registration)
            location.reload();
    });

}