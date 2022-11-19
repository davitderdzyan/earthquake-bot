const http = require('https');
const TelegramApi = require('node-telegram-bot-api')

const token = '5613701047:AAGvqqklstxPLvu4OSFRQp_ZxIblm4qbOak'
let chatId;
const bot = new TelegramApi(token, {polling: true})

bot.setMyCommands([
    {command: 'start', description: "Initial greeting"},
    {command: 'info', description: "About us"},
    {command: 'news', description: "News about Earthquake"}
])

const getPosts = (dateStr, endStr) => {
    let data = '';
    let options = {
        hostname: 'earthquake.usgs.gov',
        path: `/fdsnws/event/1/query?format=geojson&starttime=${dateStr}&endtime=${endStr}&format=geojson`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    const request = http.request(options, (response) => {
        response.setEncoding('utf8');

        response.on('data', (chunk) => {
            data += chunk;
        });

        response.on('end', () => {
            return data;
        });
    });

    request.on('error', (error) => {
        console.error(error);
    });

    request.end();
    return '';
};
bot.on('message', async (mess) => {
    chatId = mess.chat.id;
    let data = '';
    if (mess.text === '/news') {

        setInterval(async () => {
            let date = new Date(Date.now() - 1000 * 60 * 60);
            let dateStr = date.toISOString();
            date = new Date(date.getTime() + 1000 * 60 * 60);
            let endStr = date.toISOString();
            if (getPosts(dateStr, endStr) !== '') {
                data = JSON.parse(getPosts(dateStr, endStr));
                console.log(data);
                const features = data.features;
                if (features) {
                    features.map(async (feature) => {
                        if (feature.properties) {
                            await bot.sendMessage(chatId, `${feature.properties.mag} - ${feature.properties.place}`)
                        }
                    })
                }
            }
        }, 10000);
    }
    if (mess.text === "/start") {
        bot.sendMessage(mess.chat.id, "Welcome to out telegram bot here you will find new news about earthquake")
    }
    if (mess.text === "/info") {
        bot.sendMessage(mess.chat.id, "We do our best to keep you informed")
    }
})
