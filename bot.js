const Discord = require('discord.js'); //node.js' visibility is module based
const client = new Discord.Client(); //so we need to import these
const auth = require('./auth.json');//importing

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.substring(0,1) === '.') {
        if (msg.content == '.help') {
            msg.reply('Here are our commands:');
        } else {
            msg.reply('What bro, hahaha unless...?');
        }
    }
});

client.login(auth.token);