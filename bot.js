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
        } else if (msg.content === '.trendygiphy') {
            request('https://api.giphy.com/v1/gifs/trending?api_key=eRCPBSuu0d1mx3XXbgyTeiU2fcuIbce5&limit=1&rating=G', {json: true }, (err, res, body) => {
              if (err) {
                msg.reply('yikes');
              } else {
                msg.reply(body.data[0].images.original.url);
              }
            });
        } else if (msg.content.substring(0,6) === '.giphy') {

            var str1 = 'https://api.giphy.com/v1/gifs/search?api_key=eRCPBSuu0d1mx3XXbgyTeiU2fcuIbce5&q=';
            var str2 = msg.content.substring(7);
            var str3 = '&limit=1&offset=0&rating=G&lang=en';
            var req = str1 + str2 + str3;

            request(req, {json: true }, (err, res, body) => {
              if (err) {
                msg.reply('never will happen');
              } else if (body.data.length == 0) {
                msg.reply('Your key has yielded zero results.');
              } else {
                msg.reply(body.data[0].images.original.url);
              }
            });
        } else {
            msg.reply('What bro, hahaha unless...?');
        }
    }
});

client.login(auth.token);
