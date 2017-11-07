let request = require('request'),
    credentials = require('./telegram.json');

function notify(message) {
    return new Promise((resolve, reject) => {
        let text = "<b>type :</b> "+message.type +
            "\r\n<b>Info:</b> "+message.error +
            "\r\n<b>Stack Trace:</b> "+message.StackTrace;
        request.post({
            url: credentials.telegramCO.botToken,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'chat_id': credentials.telegramCO.chatId,
                'parse_mode': 'html',
                'text': text
            })
        }, (error, response, body) => {
            (!error) ? resolve(true) : console.log("Telegram request failed");
        });
    });
}

module.exports = {
    notify: notify
};
