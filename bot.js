const Discord = require('discord.js'); //node.js' visibility is module based
const client = new Discord.Client(); //so we need to import these
const auth = require('./auth.json');//importing

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }
});

client.login(auth.token);