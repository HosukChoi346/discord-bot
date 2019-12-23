const Discord = require('discord.js'); //node.js' visibility is module based
const client = new Discord.Client(); //so we need to import these
const auth = require('./auth.json');//importing
const request = require('request');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.substring(0,1) === '.') {
        if (msg.content == '.help') {
            msg.reply('Here are our commands:\nCompliments: .loveme\nWeather: .weather {city}');
        } else if (msg.content === '.loveme') {

            request('https://complimentr.com/api', {json: true }, (err, res, body) => {
                if (err) {
                    msg.reply('sorry bruh');
                } else {
                    msg.reply(body.compliment);
                }
            });
        } else if (msg.content.substring(1, 8) === 'weather') {
            var city = msg.content.substring(8);
            request(('http://api.openweathermap.org/data/2.5/weather?q=' + msg.content.substring(8) + '&APPID=dccc2f17b5a55973b45f21ebd951add2'), {json: true }, (err, res, body) => {
                if (err) {
                    msg.reply('please type correct city name');
                } else {
                    msg.reply(city + ' is ' + Math.round(body.main.temp - 273.15) + ' degrees celsius or ' + Math.round(((body.main.temp -273.15) * 9 / 5) + 32) + " degrees Farenheit.");
                    msg.reply('and the sky has ' + body.weather[0].description);
                }
            });

        } else {
            msg.reply('What bro, hahaha unless...?');
        }
    }
});

client.login(auth.token);