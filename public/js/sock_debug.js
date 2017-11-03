let _url;
if (location.protocol === "https:") {
    _url = location.protocol + "//chat.egorchepiga.ru:3001";
} else {
    if (location.hostname == "localhost") {
        _url = "http://localhost:3000"
    } else
        _url = "http://192.168.0.101:3000";
}

var socket = io.connect(_url);

function connect() {
    return socket.connected;
}