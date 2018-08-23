const Discord = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");

const config = require("./config.json");
const client = new Discord.Client();
const Schema = mongoose.Schema;
const prefix = 'v.';

let cooldown = new Set();

const bossMessageSchema = new Schema({
    ended: Boolean,
    endedTime: Number,
    nextBossesIDs: [String]
});
const bossMessage = mongoose.model('boss-message', bossMessageSchema);

const bossVoterSchema = new Schema({
    voterID: String,
    forUserID: String
});
const bossVoter = mongoose.model('boss-voter', bossVoterSchema);

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

        let bossDiscordMsg = client.channels.get(`481437245421912064`).fetchMessage(`481689230649720853`);

        bossMessage.findOne({
            ended: false
        }).then((voting) => {
            if (voting) {
                bossVoter.findOne({
                    voterID: message.author.id,
                    forUserID: user.id
                }).then((vote) => {
                    if (!vote) {
                        new bossVoter({
                            voterID: message.author.id,
                            forUserID: user.id
                        }).save();

                        bossMessage.findOne({
                            ended: false
                        }, function(err, msg) {
                            if (!msg.nextBossesIDs.includes(user.id)) {
                                msg.nextBossesIDs.push(user.id);
                                msg.save()
                            }
                        });
                    }

                });
            } else {
                new bossMessage({
                    ended: false
                }).save().then(() => {
                    console.log(`msg doc created`)
                    bossMessage.findOne({
                        ended: false
                    }, function(err, msg) {
                        msg.nextBossesIDs = user.id;
                        msg.save()
                    });

                    new bossVoter({
                        voterID: message.author.id,
                        forUserID: user.id
                    }).save().then(() => {
                        console.log(`${message.author.tag} voter doc created`);
                        bossMessage.findOne({
                            ended: false
                        }, function(err, voting) {
                            let descriptionText = '';
                            voting.nextBossesIDs.forEach(function(userID, i) {

                                bossVoter.countDocuments({
                                    forUserID: userID
                                }, function(err, count) {
                                    console.log(`${i}. ${count}`);
                                    //console.log(voting.nextBossesIDs.length - 1);

                                    if (i == (voting.nextBossesIDs.length - 1)) {
                                        let embed = new Discord.RichEmbed()
                                            .setDescription(`${descriptionText}`)

                                        client.channels.get(`481437245421912064`).fetchMessage(`481689230649720853`).then(m => {
                                            m.edit({
                                                embed
                                            });
                                        })
                                    }
                                })
                            });
                        });
                    });
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
