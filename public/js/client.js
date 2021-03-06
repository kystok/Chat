$(document).ready(function () {
    $('#textMessage').keypress(function (e) {
        if (e.keyCode == 13 && e.shiftKey == false) {
            sendMessage();
        }
        if (e.keyCode == 160) {
            e.keyCode = 32;
        }
    });
});


socket.on('NEW', function (data) {
    if (data.image)
        image(data.image);
    if (data.message)
        newMessage(data.message.sendFrom, data.message.message, "myMessage", timeMessage(data.message.date), data.message.id);
    if (data.file)
        newMessageFile(data.file.sendFrom, data.file.path, "myMessage", timeMessage(data.file.date), data.file.text, data.file.id);
});

socket.on('delete', function (argument) {
    var id = argument.id;
    try {
        document.getElementById(id).remove();
    } catch (e) {
        console.log(e);
    }
})


function image(data) {
    newMessageImage(data.sendFrom, data.img_path, "myMessage", timeMessage(data.date), data.id);
}


socket.on('users', function (data) {
    var rows = data.rows;
    var sel2 = document.getElementById('sel2');
    for (var i = 0; i < rows.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = rows[i].login;
        opt.value = rows[i].login;
        sel2.appendChild(opt);
    }
})


function createHistory(data) {
    var rows = data.rows;
    var name = getUsername();
    var time = new Date(0);
    for (var i = 0; i < rows.length; i++) {
        dayCheck(time, rows[i].date);
        time = rows[i].date;
        if (rows[i].file_path != null) {
            newMessageFile(rows[i].sendFrom, rows[i].file_path, "myMessage", timeMessage(rows[i].date), rows[i].text, rows[i].id);
            continue;
        } else {
            if (rows[i].img_path != null) {
                image(rows[i]);
                continue;
            } else {
                newMessage(rows[i].sendFrom, rows[i].text, "myMessage", timeMessage(rows[i].date), rows[i].id);
            }
        }
    }
}


function deleteMessage(id_message, id_room) {
    return socket.emit('deleteMessage', {
        id_message: id_message,
        id_room: id_room,
        sendFrom: getUsername()
    }, function (result) {
        if (result == "Done") {
            return true;
        } else {
            return false;
        }
    });

}


function setFocus() {
    $('#textMessage').focus();
}


function dayCheck(oldTime, newTime) {
    var month = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
        'Июля', 'Сентября', 'Октября', 'Ноября', 'Декабря'
    ];
    var t1 = new Date(Date.parse(oldTime));
    var t2 = new Date(Date.parse(newTime));
    var res1 = new Date(t1.getFullYear(), t1.getMonth(), t1.getDate());
    var res2 = new Date(t2.getFullYear(), t2.getMonth(), t2.getDate());
    if (res1 < res2) {
        if (t1.getFullYear() == t2.getFullYear()) {
            var res = (t2.getDate() < 10 ? '0' : '') + t2.getDate() + "  " + month[t2.getMonth() - 1];
            newDateLine(res);
        } else {
            var res = (t2.getDate() < 10 ? '0' : '') + t2.getDate() + "  " +
                month[t2.getMonth() - 1] + "  " + t2.getFullYear();
            newDateLine(res);
        }

    }

}


function addConversation() {
    var users = $('#sel2').val();
    users.push(getUsername().substring(0, getUsername().indexOf(".")));
    var name = "";
    if (users.length == null) {
        return null;
    }
    name = prompt("Введите название беседы");
    if (name == "") {
        name = users.join(', ');
    }
    var from = getUsername();
    _addConversation(users, name, from, function (result) {
        if (result)
            loadRoom(result);
    })
}

function _addConversation(users, name, sendFrom, callback) {
    socket.emit('addConversation', {users: users, name: name, sendFrom: sendFrom}, function (data) {
        callback(data);
    });
}

function showRoom() {
    socket.emit('loadRoom', getUsername(), function (result) {
        if (result)
            loadRoom(result);
    });
}

function loadRoom(result) {
    $('#selopt').children().remove();
    for (var i = 0; i < result.length; i++) {
        $('#selopt').append($('<option>', {value: result[i].id, text: result[i].name}))
    }
}


function loadConversation() {
    $('#messageHistory').children().remove();
    var room = $('#sel').val();
    var limit = 10;
    if (room) {
        loadMessages(room, limit, function (data) {
            if (data)
                createHistory(data);
        })
    }
    if (room == null) {
        showRoom();
    }
}

function loadMessages(room, limit, callback) {
    socket.emit('changeRoom', {room: room, limit: limit}, function (result) {
        callback(result);
    });
}


function loadUsers() {
    socket.emit('users', getUsername());
}


function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}


function scrolling() {
    $("#messageHistory").scrollTop($('#messageHistory').prop("scrollHeight"));
}

function getUsername() {
    return getCookie("username");
}


function uploadFile() {
    var i = 0;
    var file = document.getElementById('myfile');
    var data = new FormData();
    data.append('uploadFile', file.files[0]);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "./files", true);
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (this.readyState != 4) return; //rediState = 4 => DONE.  Операция полностью завершена. так лишний проход убирается
        if (this.status != 200) {
            // обработать ошибку
            alert('ошибка: ' + (this.status ? this.statusText : 'не удалось загрузить файл'));
            return;
        } else {
            var room = $('#sel').val();
            var response = JSON.parse(xhr.responseText);
            socket.emit('uploadFile', {
                    name: response.name,
                    path: response.path,
                    room: room,
                    sendFrom: getUsername()
                },
                (data) => {
                    newMessageFile(data.username, data.path, "myMessage", timeMessage(data.date), data.text, data.id);
                })
        }
    }

}


function timeMessage(time) {
    var alignment = Date.parse(time);
    var t = new Date(alignment);
    var result = t.getHours() + ":" + (t.getMinutes() < 10 ? '0' : '') + t.getMinutes();
    return result;
}

function sendMessage() {
    if ($('#textMessage').text()) {
        if ($('#sel').val()) {
            message($('#textMessage').text(), $('#sel').val(), getUsername(), function (data) {
                if (data.result)
                    backMessage(data.backData)
                else alert(data.info)
            });
            $('#textMessage').html('');
        } else {
            alert('Диалог не выбран');
        }
    }
}

//отправляем данные серверу
function message(message, room, sendFrom, callback) {
    socket.emit('message', {room, message, sendFrom}, function (data) {
        callback(data);
    });
}

function backMessage(data) {
    if (data.image)
        image(data.image);
    if (data.message)
        newMessage(data.message.sendFrom, data.message.message, "myMessage", timeMessage(data.message.date), data.message.id_message);

}

function TimeZoneAlignment(time) {
    var now = new Date();
    return timeMessageDate.parse(time) + now.getTimezoneOffset() * 100000;
}


//выводим смс
function newMessage(from, data, style, time, id) {
    var history = document.getElementById('messageHistory');
    var div = newElemMessage(from, data, style, time, id);
    history.appendChild(div);
    scrolling();
}

function delete_mes() {
    var id = $(this).parents()[2].id;
    var room = $('#sel').val()
    if (deleteMessage(id, room)) $(this).parents()[2].remove();
}

//создаем блок для смс
function newElemMessage(from, data, style, time, id) {
    var div = document.createElement('div');
    var divFrom = newElemTime(time, from);
    var divData = newElemData(data);
    div.className = style;
    div.id = id; //в идеале для конечного клиента нужно делать через другие атрибуты, data-* (data-msgid к примеру)
    var div_all = skelet_message(divFrom, divData);
    div.appendChild(div_all);
    return div;
}


function newElemData(data) {
    var divData = document.createElement('div');
    divData.innerHTML = data;
    divData.className = "dataMessage";
    return divData;
}


function newElemTime(time, from) {
    var divFrom = document.createElement('div');
    var a1 = document.createElement('a');
    var a2 = document.createElement('a');
    divFrom.className = "fromMessage-panel";
    a1.innerHTML = from;
    a1.className = "fromMessage";
    a2.innerHTML = time;
    a2.className = "timeMessage";
    divFrom.appendChild(a1);
    divFrom.appendChild(a2);
    return divFrom;
}


function newDateLine(date) {
    var history = document.getElementById('messageHistory');
    var div = document.createElement("div");
    div.className = "dateLine";
    div.innerHTML = date;
    history.appendChild(div);
}

//------------------------------IMAGE--------------------------------

function newMessageImage(from, url, style, time, id) {
    var history = document.getElementById('messageHistory');
    var div = newElemImage(from, url, style, time, id);
    history.appendChild(div);
    scrolling();
}

function newElemImage(from, url, style, time, id) {
    var div = document.createElement('div');
    var divFrom = newElemTime(time, from);
    var img = newImg(url);
    div.className = style;
    div.id = id; //в идеале для конечного клиента нужно делать через другие атрибуты, data-* (data-msgid к примеру)
    var div_all = skelet_message(divFrom, img);
    div.appendChild(div_all);
    return div;
}


function skelet_message(from, data) {
    var div = document.createElement('div');
    var div_all = document.createElement('div');
    var control = document.createElement('div');
    var mes = document.createElement('div');
    control.className = "controls";
    var center = document.createElement('div');
    center.className = "center";
    center.onclick = delete_mes;
    div_all.className = "mes-flex";
    mes.className = "mes-block";
    mes.appendChild(from);
    mes.appendChild(data);
    control.appendChild(center);
    div_all.appendChild(mes);
    div_all.appendChild(control);
    return div_all;
}


function newImg(url) {
    var img = document.createElement("img");
    img.src = url;
    img.className = 'imgMessage';
    return img;
}


//--------------------------FILE------------------------------------
function newMessageFile(sendFrom, file_path, style, date, text, id) {
    var history = document.getElementById('messageHistory');
    var div = newElemLink(sendFrom, file_path, style, date, text, id);
    history.appendChild(div);
    scrolling();
}


function newElemLink(sendFrom, file_path, style, date, text, id) {
    var div = document.createElement('div');
    var divFrom = newElemTime(date, sendFrom);
    var a = newLink(file_path, text);
    div.className = style;
    div.id = id; //в идеале для конечного клиента нужно делать через другие атрибуты, data-* (data-msgid к примеру)
    var div_all = skelet_message(divFrom, a);
    div.appendChild(div_all);
    return div;
}


function newLink(link, text) {
    var a = document.createElement("a");
    a.href = '.' + link;
    a.innerHTML = text;
    return a;
}

//--------------------------------------------------------------