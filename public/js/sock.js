var _local = location.protocol + "//localhost:3000";
var _global = location.protocol + "//localhost:3000";

if (location.href.match(/(local)/gim)) {
    var socket = io.connect(_local); //локальный адрес, в ссылке есть слово local
    console.log('local')
} else {
    var socket = io.connect(_global); //глобальный адрес, в ссылке нет слова local
    console.log('global')
}