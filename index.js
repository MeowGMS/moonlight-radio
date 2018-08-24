const Discord = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");

const config = require("./config.json");
const client = new Discord.Client();
const Schema = mongoose.Schema;
const prefix = 'v.';

let cooldown = new Set();

const bossMessageSchema = new Schema({
    id: String,
    ended: Boolean,
    endedTime: Number,
    nextBossesIDs: [String],
    leftUsersIDs: [String],
    maxVoteCount: Number,
    equalVotesCountUsersIDs: [String]
});
const bossMessage = mongoose.model('boss-message', bossMessageSchema);

const bossVoterSchema = new Schema({
    voterID: String,
    forUserID: String
});
const bossVoter = mongoose.model('boss-voter', bossVoterSchema);

client.commands = new Discord.Collection();

/*fs.readdir("./commands/", (err, files) => {

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
}); */

mongoose.connect(process.env.mongo_url, {
    useNewUrlParser: true
}, () => {
    console.log(` - Подключено к базе данных`);
});

function declOfNum(number, titles) {
    cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

client.on("ready", async () => {
    console.log(` - ${client.user.username} онлайн на ${client.guilds.size} серверах!\n\n======================================`);

    let nowTimeStamp = Date.now()

    console.log(`Время сейчас: ${nowTimeStamp}`);

});

client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newVoiceChannel = newMember.voiceChannel;
    let oldVoiceChannel = oldMember.voiceChannel;

    if (newVoiceChannel != undefined && newVoiceChannel.id == '481418191365472256' /* && newVoiceChannel.members.size >= 10*/ ) {
        bossMessage.findOne({
            'ended': false
        }).then((voting) => {
            if (!voting) {
                bossMessage.findOne({
                    "id": "timeCheck",
                    'ended': true
                }, function(err, voting) {
                    let nowTimeStamp = Date.now()

                    //if (voting.endedTime + 14400000 <= nowTimeStamp) {

                    new bossMessage({
                        ended: false,
                        maxVoteCount: 0
                    }).save().then(() => {
                        console.log(`msg doc created`);

                        let embed = new Discord.RichEmbed()
                            .setAuthor(`Голосование начинается`)
                            .setDescription(`**У вас появилась возможность проголосовать за будущего босса Trash Room**\n\nДля этого необходимо в этом канале прописать\n\`+ упоминание пользователя\` (Например: **+ <@${client.user.id}>**)\n\nПри выходе из канала:\n    • Ваш голос обнулится и вы не будете в праве проголосовать снова\n    • Вы не сможете стать боссом румы во время этого голосования\n\n***Проголосовать можно ТОЛЬКО ОДИН раз***`)
                            .setColor(`#36393E`)

                        client.channels.get(`481437245421912064`).fetchMessage(`481689230649720853`).then(m => {
                            m.edit({
                                embed
                            });
                        });

                        setTimeout(function() {
                            bossMessage.findOne({
                                'ended': false
                            }, function(err, voting) {
                                voting.nextBossesIDs.forEach(function(id) {
                                    bossVoter.countDocuments({
                                        'forUserID': id
                                    }, function(err, count) {
                                        bossMessage.findOne({
                                            'ended': false
                                        }, function(err, msg) {
                                            if (msg.maxVoteCount < count) {
                                                msg.maxVoteCount = count;
                                                msg.save();
                                            }
                                        });
                                    });
                                });

                                setTimeout(function() {
                                    voting.nextBossesIDs.forEach(function(id) {
                                        bossVoter.countDocuments({
                                            'forUserID': id
                                        }, function(err, count) {
                                            bossMessage.findOne({
                                                'ended': false
                                            }, function(err, msg) {
                                                if (count == msg.maxVoteCount && !msg.equalVotesCountUsersIDs.includes(id)) {
                                                    msg.equalVotesCountUsersIDs.push(id);
                                                    msg.save();
                                                }
                                            });
                                        });
                                    });

                                    setTimeout(function() {
                                        bossMessage.findOne({
                                            'ended': false
                                        }, function(err, msg) {

                                            setTimeout(function() {
                                                client.channels.get(`481437245421912064`).fetchMessage(`481689230649720853`).then(m => {

                                                    if (msg.equalVotesCountUsersIDs.length > 1) {
                                                        let randomNum = Math.floor(Math.random() * (msg.equalVotesCountUsersIDs.length - 0));
                                                        console.log(randomNum);

                                                        embed = new Discord.RichEmbed()
                                                            .setAuthor(`Голосование закончилось`)
                                                            .setDescription(`**Боссом стал <@${msg.equalVotesCountUsersIDs[randomNum]}>**\n\nДо нового голосования нужно ждать 4 часа`)
                                                            .setColor(`#00D11A`)
                                                    } else {
                                                        embed = new Discord.RichEmbed()
                                                            .setAuthor(`Голосование закончилось`)
                                                            .setDescription(`**Боссом стал <@${msg.equalVotesCountUsersIDs[0]}>**\n\nДо нового голосования нужно ждать 4 часа`)
                                                            .setColor(`#00D11A`)
                                                    }

                                                    m.edit({
                                                        embed
                                                    });
                                                });

                                                msg.ended = true;
                                                msg.save();
                                            }, 1000);
                                        });
                                    }, 1000);
                                }, 2000);
                            });
                        }, 30000);
                    });
                    //}
                });

            }
        });
    }

    if (newVoiceChannel == undefined && oldVoiceChannel.id == '481418191365472256') {
        bossMessage.findOne({
            'ended': false
        }).then((voting) => {
            if (voting) {
                bossVoter.deleteMany({
                    'voterID': newMember.user.id
                }).then(() => console.log(`docs deleted`))

                bossMessage.findOne({
                    'ended': false
                }, function(err, voting) {
                    if (!voting.leftUsersIDs.includes(newMember.id)) {
                        voting.leftUsersIDs.push(newMember.id);
                    }
                });
            }
        });
    }
});

client.on("message", async message => {

    if (message.content.startsWith('+')) {

        message.delete(200);

        let user = message.mentions.users.first();

        if (!user) return message.channel.send(`**Юзер не найден**`).then(m => m.delete(1000));
        if (user.id == message.author.id) return message.channel.send(`**Нельзя голосовать за самого себя**`).then(m => m.delete(1000));

        bossMessage.findOne({
            ended: false
        }).then((voting) => {
            if (voting) {
                bossVoter.findOne({
                    voterID: message.author.id
                    //forUserID: user.id
                }).then((voter) => {
                    if (!voter) {
                        new bossVoter({
                            'voterID': message.author.id,
                            'forUserID': user.id
                        }).save().then(() => {
                            bossMessage.findOne({
                                'ended': false
                            }, function(err, msg) {
                                if (!msg.nextBossesIDs.includes(user.id)) {
                                    msg.nextBossesIDs.push(user.id);
                                    msg.save()
                                }
                            }).then(() => {
                                bossMessage.findOne({
                                    'ended': false
                                }, function(err, voting) {
                                    let descriptionText = '';
                                    voting.nextBossesIDs.forEach(function(userID, i) {

                                        bossVoter.countDocuments({
                                            'forUserID': userID
                                        }, function(err, count) {
                                            console.log(`${i}. ${count}`);
                                            descriptionText += `**<@${userID}> - ${count} ${declOfNum(count, ['голос', 'голоса', 'голосов'])}**\n`;

                                            if (i == (voting.nextBossesIDs.length - 1)) {
                                                let embed = new Discord.RichEmbed()
                                                    .setAuthor(`Голосование идёт`)
                                                    .setDescription(`На данный момент:\n\n${descriptionText}`)

                                                //setTimeout(function() {}, 1000);

                                                client.channels.get(`481437245421912064`).fetchMessage(`481689230649720853`).then(m => {
                                                    m.edit({
                                                        embed
                                                    });
                                                })
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            }
            /* else {
                           new bossMessage({
                               ended: false,
                               maxVoteCount: 0
                           }).save().then(() => {
                               console.log(`msg doc created`)
                               bossMessage.findOne({
                                   'ended': false
                               }, function(err, msg) {
                                   msg.nextBossesIDs = user.id;
                                   msg.save()
                               });

                               new bossVoter({
                                   'voterID': message.author.id,
                                   'forUserID': user.id
                               }).save().then(() => {
                                   console.log(`${message.author.tag} voter doc created`);
                                   bossMessage.findOne({
                                       'ended': false
                                   }, function(err, voting) {
                                       let descriptionText = '';
                                       voting.nextBossesIDs.forEach(function(userID, i) {

                                           bossVoter.countDocuments({
                                               'forUserID': userID
                                           }, function(err, count) {
                                               console.log(`${i}. ${count}`);


                                               descriptionText += `**<@${userID}> - ${count} ${declOfNum(count, ['голос', 'голоса', 'голосов'])}**\n`;
                                               //console.log(voting.nextBossesIDs.length - 1);

                                               if (i == (voting.nextBossesIDs.length - 1)) {
                                                   let embed = new Discord.RichEmbed()
                                                       .setAuthor(`Состояние голосования: идёт`)
                                                       .setDescription(`На данный момент:\n\n${descriptionText}`)

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
                       } */
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

    if (cmd == `v.randomtest`) {
        message.delete(200);

        let iW = 0;

        while (iW < 100) {
            let randomNum = Math.floor(Math.random() * (parseInt(args[0], 10) - 0));
            
            console.log(randomNum);
        }
    }

    let commandfile = client.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(client, message, args, dbMessage, User);
});

client.login(process.env.token).catch(console.error);
