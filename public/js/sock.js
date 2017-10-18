if (location.href.match(/(local)/gim)) {
    var socket = io.connect('http://localhost:3000'); //локальный адрес, в ссылке есть слово local
    console.log('local')
} else {
    var socket = io.connect('http://localhost:3000'); //глобальный адрес, в ссылке нет слова local
    console.log('global')
}