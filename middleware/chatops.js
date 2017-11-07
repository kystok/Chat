let request = require('request'),
    credentials = require('./telegram.json');

function notify(message) {
    try {
        message.stackTrace = message.stackTrace
            .replace(/(<)/gim, '&lt;')
            .replace(/(>)/gim, '&gt;')
            .replace(/("')/gim, '&quot;')
            .replace(/(&)/gim, '&amp;');
    } catch (e) {};

    return new Promise((resolve, reject) => {
        let text = "<b>type :</b> "+message.type +
            "\r\n<b>Info:</b> "+message.info +
            "\r\n<b>Stack Trace:</b> "+message.stackTrace;
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
