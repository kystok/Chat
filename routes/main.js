var path = require('path');
const logger = require('../middleware/logger').logger(path.basename(__filename)),
    log = require('../middleware/logger').log;

module.exports = function (app) {

    var login = require('./login').router,
        register = require('./register').router,
        logout = require('./logout'),
        multiparty = require('multiparty'),
        express = require('express'),
        router = express.Router(),
        path,
        name,
        fs = require("fs");


    app.use('/', login);
    app.use('/register', register);
    app.use('/logout', logout);


    app.post('/files', function (req, res, next) {
        // создаем форму
        var form = new multiparty.Form();
        //console.log(form);

        //здесь будет храниться путь с загружаемому файлу, его тип и размер
        var uploadFile = {uploadPath: '', type: '', size: 0};
        //максимальный размер файла
        var maxSize = 100 * 1024 * 1024; //2MB
        //поддерживаемые типы(в данном случае это картинки формата jpeg,jpg и png)
        var supportMimeTypes = [
            'image/jpg',
            'image/jpeg',
            'image/png',
            'application/zip',
            'application/vnd.ms-excel',
            'application/x-ms-dos-executable'
        ];
        //массив с ошибками произошедшими в ходе загрузки файла
        var errors = [];

        //если произошла ошибка
        form.on('error', function (err) {
            if (fs.existsSync(uploadFile.path)) {
                //если загружаемый файл существует удаляем его
                fs.unlinkSync(uploadFile.path);
                log('INFO', "ошибка в загрузке файла", err);
            }
        });

        form.on('close', function () {
            //если нет ошибок и все хорошо
            if (errors.length == 0) {
                //сообщаем что все хорошо
                res.send({status: 'ok', text: 'Success', name: name, path: path});
            } else {
                if (fs.existsSync(uploadFile.path)) {
                    //если загружаемый файл существует удаляем его
                    fs.unlinkSync(uploadFile.path);
                }
                //сообщаем что все плохо и какие произошли ошибки
                res.send({status: 'bad', errors: errors});
            }
        });

        // при поступление файла
        form.on('part', function (part) {
            //читаем его размер в байтах
            uploadFile.size = part.byteCount;
            //читаем его тип
            uploadFile.type = part.headers['content-type'];
            //путь для сохранения файла
            path = uploadFile.path = 'public/files/' + part.filename;
            name = part.filename;
            //проверяем размер файла, он не должен быть больше максимального размера
            if (uploadFile.size > maxSize) {
                errors.push('File size is ' + uploadFile.size + '. Limit is' + (maxSize / 1024 / 1024) + 'MB.');
            }

            //проверяем является ли тип поддерживаемым
            if (supportMimeTypes.indexOf(uploadFile.type) == -1) {
                errors.push('Unsupported mimetype ' + uploadFile.type);
            }
            //если нет ошибок то создаем поток для записи файла
            if (errors.length == 0) {
                var out = fs.createWriteStream(uploadFile.path)
                part.pipe(out);
                //res.send({ status: 'Done', text: 'file uploaded successfully' });
            } else {
                log("INFO", "присутсвуют ошибки при загрузке фала", errors);
                //пропускаем
                //вообще здесь нужно как-то остановить загрузку и перейти к onclose
                part.resume();
            }
        });

        // парсим форму
        try {
            form.parse(req);
        } catch (e) {
            log("WARN", "ошибка при парсинге формы", {error: e, request: req});
        }
    });


}