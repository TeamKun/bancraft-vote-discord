const Discord = require('discord.js');
const Parser = require('discord-command-parser');
const settings = require('./settings.js');

const prefix = "/";
const client = new Discord.Client();

class Vote {
    voting = false;
    voted = [];

    static countBy(collection, func) {
        let object = Object.create(null);

        collection.forEach(function(item) {
            let key = func(item);
            if (key in object) {
                ++object[key];
            } else {
                object[key] = 1;
            }
        });

        return object;
    }

    async onCommand(parsed) {
        const msg = parsed.message;

        if (parsed.command === 'vs') {
            if (!this.voting) {
                await msg.channel.send('投票を開始しました。\n/v <プレイヤー名>で投票をしてください。');
                this.voting = true;
                this.voted = [];
            } else {
                this.voting = false;

                const counted = Vote.countBy(this.voted, vote => vote.to.displayName);
                const result = Object.entries(counted)
                    .sort((a, b) => b[1] - a[1])
                    .map((a, index) => `${index+1}位: ${a[0]} (${a[1]}票)`)
                    .join('\n');
                await msg.channel.send(`投票を終了しました。\n${result}`);
            }
        }

        if (parsed.command === 'v') {
            if (!this.voting) {
                await msg.reply('まだ投票が始まっていません。');
                return;
            }
            let member = msg.mentions.members.first();
            if (member === undefined) {
                const members = await msg.guild.members.fetch();
                member = members.find(e => e.displayName === parsed.arguments[0]);
            }
            if (member === undefined) {
                await msg.reply('メンバーが見つかりません。');
                return;
            }
            const exists = this.voted.find(vote => vote.from.id === msg.author.id);
            if (exists !== undefined) {
                await msg.reply('既に投票しています。');
                return;
            }
            await msg.reply(member.displayName + 'に投票しました。');
            this.voted.push({ from: msg.guild.member(msg.author), to: member });
        }

        if (parsed.command === 'vget') {
            if (this.voting) {
                await msg.reply('投票が終わっていません。');
                return;
            }
            const result = this.voted
                .map(vote => `${vote.from.displayName} >> ${vote.to.displayName}`)
                .join('\n');
            await msg.channel.send(`========= 投票先一覧 =========\n${result}\n========= 投票先一覧 =========`);
        }
    }
}

let instances = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    const parsed = Parser.parse(msg, prefix);
    if (!parsed.success)
        return;
    if (instances[msg.channel.id] === undefined)
        instances[msg.channel.id] = new Vote();
    await instances[msg.channel.id].onCommand(parsed);
});

client.login(settings.bot_token);