const Discord = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");

const config = require("./config.json");
const client = new Discord.Client();
const Schema = mongoose.Schema;
const prefix = 'v.'

let cooldown = new Set();

const bossMessageSchema = new Schema({
    messageID: String,
    channelID: String,
    userVotesInfo: [[]], //id, votesCount, username, userForVote
    ended: Boolean
});
const bossMessage = mongoose.model('boss-message', bossMessageSchema);

const bossUserSchema = new Schema({
    id: String,
    username: String,
    votesCount: Number,
    votesForUsersIDs: String
});
const bossUser = mongoose.model('boss-user', bossUserSchema);


client.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    let commandCount = 0;

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log(`Команда не найдена`);
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        let commandName = f.slice(-2);

        console.log(`Файл ${f} загружен!`);
        commandCount = commandCount + 1;

        client.commands.set(props.help.name, props);
    });
    console.log(`======================================\n\n - Всего загружено ${commandCount} команд`);
});

mongoose.connect(process.env.mongo_url, {
    useNewUrlParser: true
}, () => {
    console.log(` - Подключено к базе данных`);
});

client.on("ready", async () => {
    console.log(` - ${client.user.username} онлайн на ${client.guilds.size} серверах!\n\n======================================`);

    let nowTimeStamp = Date.now()

    console.log(`Время сейчас: ${nowTimeStamp}`);

});

client.on("message", async message => {

    if (message.content.startsWith('+')) {

        message.delete(200);

        console.log(`Начало`);
        let user = message.mentions.users.first();

        if (!user) return message.channel.send(`**Юзер не найден**`).then(m => m.delete(3000));
        console.log(`user.id=${user.id}`);

        bossMessage.findOne({
            usersVotes: {
                id: user.id
            },
            ended: false
        }).then((user) => {
            if (user) {

                bossMessage.findOne({
                    ended: false
                }, function(err, msg) {

                    for (let i = 0; i < msg.userVotesInfo.length; i++) {
                        if (user.id == msg.usersVotes[i][0]) {
                            if (msg.userVotesInfo[i][1] != undefined) {
                                msg.userVotesInfo[i][1] += 1;
                            } else {
                                msg.userVotesInfo[i][1] = 1;
                            }
                        }
                    }

                    let bossMessage = client.channels.get('481437245421912064').fetchMessage('481689230649720853');
                    let descriptionText = '';

                    msg.usersVotes.forEach(function(voteInfo, index) {
                        descriptionText = `<@${voteInfo[0]}> - ${voteInfo[1]}\n`

                        if (index == msg.usersVotes.length - 1) {
                            let embed = new Discord.RichEmbed()
                                .setColor('GREEN')
                                .setAuthor(`Идёт голосование...`)
                                .setDescription(`Текущие результаты:\n\n**${descriptionText}**`)

                            bossMessage.edit({
                                embed
                            });
                        }
                    });


                });
            } else {
                let bossMessage = client.channels.get('481437245421912064').fetchMessage('481689230649720853');

                let user = message.mentions.users.first();

                new bossMessage({
                    messageID: '481689230649720853',
                    channelID: '481437245421912064',
                    userVotesInfo: [user.id, 1, user.username, message.author.id],
                    ended: false
                }).save().then(() => console.log(`doc created`));

                let embed = new Discord.RichEmbed()
                    .setColor('GREEN')
                    .setAuthor(`Идёт голосование...`)
                    .setDescription(`Текущие результаты:\n\n**${message.author} - 1 голос**`)

                bossMessage.edit({
                    embed
                });
            }
        });
    }

    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;

    if (cooldown.has(message.author.id)) {
        message.delete();
        return message.channel.send(`**Вы должны подождать \`5\` секунд, прежде чем использовать команду**`)
    }
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        cooldown.add(message.author.id);
    }
    setTimeout(() => {
        cooldown.delete(message.author.id)
    }, 5000);

    let messageArray = message.content.split(/\s+/g);
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    if (cmd == `v.aaaa0000` && message.member.hasPermission('ADMINISTRATOR')) {
        message.delete(200);

        let embed = new Discord.RichEmbed()
            .setDescription(`**Голосования ещё не было. Начните его первыми**\n\n**Для начала нужно:\n • 10 человек в войсе\n • Должно пройти 4 часа с прошлого голосования**\n\nЕсли вы покинете войс, то ваш голос обнулится`)
            .setFooter(`Moonlight | Trash Boss`)
        message.channel.send({
            embed
        })
    }

    let commandfile = client.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(client, message, args, dbMessage, User);
});

client.login(process.env.token).catch(console.error);
