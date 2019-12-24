const Discord = require('discord.js'); //node.js' visibility is module based
const client = new Discord.Client(); //so we need to import these
const auth = require('./auth.json');//importing
const request = require('request');
const ytdl = require('ytdl-core');
var values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
var suits = ['spades', 'diamonds', 'clubs', 'hearts'];
const deck = getDeck();
shuffleDeck();

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
        } else if (msg.content === '.blackjack') {
            blackjack(msg);
        } else {
            msg.reply('What bro, hahaha unless...?');
        }
    }
});

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