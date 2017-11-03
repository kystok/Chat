if (location.protocol == "https:") {
	var _url = location.protocol + "//chat.egorchepiga.ru:3001";
} else {
	var _url = "http://192.168.0.101:3000";
}

var socket = io.connect(_url);

function connect() {
    return socket.connected;
}
