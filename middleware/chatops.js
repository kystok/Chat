let request = require('request'),
    credentials = require('./telegram.json');

function notify(message) {
    request.post({
        url: credentials.telegramCO.botToken,
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            'chat_id': credentials.telegramCO.chatId,
            'parse_mode': 'Markdown',
            'text': message
        })
    }, (error, response, body) => {
    });
};

module.exports = {
    notify: notify
};
