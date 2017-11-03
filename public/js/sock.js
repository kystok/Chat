if (socket == "undefined") { console.log("socket = undefined");
	if (location.protocol == "https:") {
	    var _url = location.protocol + "//chat.egorchepiga.ru:3001";
    } else {
	    var _url = location.protocol + "//chat.egorchepiga.ru:3000";
    }};
	var socket = io.connect(_url);
