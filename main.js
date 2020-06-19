const Discord = require('discord.js');
const client = new Discord.Client();

let voting = false;
let voted = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === '/vs') {
        msg.reply('投票開始');
        voting = true;
    }
    if (msg.content === '/v') {
        if (!voting) {
            msg.reply('まだ投票が始まっていません');
            return;
        }
        voting = true;
    }
});

client.login('token');