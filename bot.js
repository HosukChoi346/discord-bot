const Discord = require('discord.js'); //node.js' visibility is module based
const { prefix, token, } = require('./auth.json');
const client = new Discord.Client(); //so we need to import these
const queue = new Map();
const auth = require('./auth.json');//importing
const request = require('request');
var values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
var suits = ['spades', 'diamonds', 'clubs', 'hearts'];
const deck = getDeck();
shuffleDeck();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});

client.on('message', async msg => {
    if (msg.author.bot) return;
    if (msg.content.substring(0,1) === '.') {

        const serverQueue = queue.get(msg.guild.id);
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
                    try {
                        msg.reply(city + ' is ' + Math.round(body.main.temp - 273.15) + ' degrees celsius or ' + Math.round(((body.main.temp -273.15) * 9 / 5) + 32) + ' degrees Farenheit.');
                        msg.reply('and the sky has ' + body.weather[0].description);
                    } catch(error) {
                        msg.reply('enter a valid city (capitals matter!!)');
                    }
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
        } else if (msg.content.substring(0, 6) === '.giphy') {

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
        } else if (msg.content === '.blackjack') {
            blackjack(msg);
        } else if (msg.content.substring(0, 5) === '.play') {
            execute(msg, serverQueue);
            return;
        } else if (msg.content.substring(0, 5) === '.skip') {
            skip(msg, serverQueue);
            return;
        } else if (msg.content.substring(0, 5) === '.stop') {
            stop(msg, serverQueue);
            return;
        } else {
            msg.reply('What bro, hahaha unless...?');
        }
    }
});

async function execute(msg, serverQueue) {
	const args = msg.content.split(' ');

	const voiceChannel = msg.member.voiceChannel;
	if (!voiceChannel) return msg.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(msg.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return msg.channel.send('I need the permissions to join and speak in your voice channel!');
	}

	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(msg.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(msg.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(msg.guild.id);
			return msg.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return msg.channel.send(`${song.title} has been added to the queue!`);
	}

}

function skip(msg, serverQueue) {
	if (!msg.member.voiceChannel) return msg.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return msg.channel.send('There is no song that I could skip!');
	serverQueue.connection.dispatcher.end();
}

function stop(msg, serverQueue) {
	if (!msg.member.voiceChannel) return msg.channel.send('You have to be in a voice channel to stop the music!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

client.login(auth.token);

function getDeck() {
    var newDeck = new Array();
    for (var i = 0; i < suits.length; i++) {
        for (var x = 0; x< values.length; x++) {
            var card = {Value: values[x], Suit: suits[i]};
            newDeck.push(card);
        }
    }
    return newDeck;
}

function shuffleDeck() {
    for (var i = 0; i < 999; i++) {
        var location1 = Math.floor((Math.random() * deck.length));
        var location2 = Math.floor((Math.random() * deck.length));
        while (location1 == location2) {
            var location1 = Math.floor((Math.random() * deck.length));
        }
        var tmp = deck[location1];
        deck[location1] = deck[location2];
        deck[location2] = tmp;
    }
}

function blackjack(message) {
    player = [];
    player.push(deck.pop());
    player.push(deck.pop());

    dealer = [];
    dealer.push(deck.pop());
    dealer.push(deck.pop());

    printPlayerHand(player, message);
    printDealerHand(dealer, message);
}

function printPlayerHand(hand, message) {
    for (var i = 0; i < hand.length; i++) {
        message.reply('You have a ' + hand[i].Value + ' of ' + hand[0].Suit);
    }
    let total = getTotal(hand);
    message.reply('Your total is ' + total);
}

function printDealerHand(hand, message) {
    message.reply('Dealer\'s second card is the ' + hand[1].Value + ' of ' + hand[1].Suit);
}

function getTotal(hand) {
    let total = 0;
    let aceCounter = 0;
    for (var i = 0; i < hand.length; i++) {
        switch(hand[i].Value) {
            case '2':
                total += 2;
                break;
            case '3':
                total += 3;
                break;
            case '4':
                total += 4;
                break;
            case '5':
                total += 5;
                break;
            case '6':
                total += 6;
                break;
            case '7':
                total += 7;
                break;
            case '8':
                total += 8;
                break;
            case '9':
                total += 9;
                break;
            case '10':
                total += 10;
                break;
            case 'J':
                total += 10;
                break;
            case 'Q':
                total += 10;
                break;
            case 'K':
                total += 10;
                break;
            case 'A':
                aceCounter++;
                break;
        }
    }
    for (var i = 0; i < aceCounter; i++) {
        if (total + 11 > 21) {
            total++;
        } else {
            total += 11;
        }
    }
    return total;
}
