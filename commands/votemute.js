const Discord = require("discord.js");
const config = require("../config.json");
const prefix = "v.";


module.exports.run = async (client, message, args, dbMessage) => {

    const messageArray = message.content.split(/\s+/g);
    const otherArgs = messageArray.slice(1);
    const command = messageArray[0].slice(prefix.length).toLowerCase();

    function declOfNum(number, titles) {
        cases = [2, 0, 1, 1, 1, 2];
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    }

    if (!message.member.roles.has(config.voteRoleID) && !message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`**❌ У Вас нет прав использовать данную команду**`).then(m => m.delete(5000));

    message.delete(300);

    let lastSymbol = messageArray[2][messageArray[2].length-1];
    let titlesArray = [''];
    let multNum = 0;

    if (lastSymbol == 'm' || lastSymbol == 'м') {
        titlesArray = ['минута', 'минуты', 'минут'];
        multNum = 60000;
        let punishTime = parseInt(messageArray[2].slice(0, -1), 10);
    } else if (lastSymbol == 'h' || lastSymbol == 'ч') {
        titlesArray = ['час', 'часа', 'часов'];
        multNum = 3600000;
        let punishTime = parseInt(messageArray[2].slice(0, -1), 10);
    } else {
        titlesArray = ['минута', 'минуты', 'минут'];
        multNum = 60000;
        let punishTime = parseInt(messageArray[2], 10);
    }

    let userForPunish = message.mentions.users.first();
    let punishTime = parseInt(messageArray[2], 10);
    let reasonArgCount = prefix.length + command.length + messageArray[1].length + messageArray[2].length + 3;
    let punishReason = message.content.slice(reasonArgCount);

    if (!userForPunish) return message.channel.send(`**\\❌ Юзер не найден**`).then(m => m.delete(5000));
    if (!punishTime) return message.channel.send(`**\\❗ Укажите время мута**`).then(m => m.delete(5000));
    if (!messageArray[3]) return message.channel.send(`**\\❗ Укажите причину мута**`).then(m => m.delete(5000));
    if (userForPunish.bot) return message.channel.send(`**\\❗ Невозможно замутить бота**`).then(m => m.delete(5000));
    if (message.guild.members.get(userForPunish.id).roles.has(config.muteRoleID)) return message.channel.send(`**\\❌ Пользователь уже замучен**`).then(m => m.delete(5000));
    //if (userForPunish.id == message.author.id) return message.channel.send(`**\\❌ Невозможно замутить самого себя**`).then(m => m.delete(5000));

    let punishTimeMs = multNum * punishTime;

    dbMessage.findOne({
        punishableID: userForPunish.id,
        ended: false
    }).then((voting) => {
        if (voting) {
            return message.channel.send(`**\\❌ Голосование по поводу мута данного юзера уже запущено**`).then(m => m.delete(5000));
        } else {

            let embed = new Discord.RichEmbed()
                .setAuthor(`${message.author.tag}`, `${message.author.avatarURL}`)
                .addField(`Кого наказывают?`, `${userForPunish}`, true)
                .addField(`Время мута`, `${punishTime} ${declOfNum(punishTime, titlesArray)}`, true)
                .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``)
                .setThumbnail(`${userForPunish.avatarURL}`)
                .setColor(`#36393E`)
                .setFooter(`${message.guild.name}`)
                .setTimestamp()

            //client.guilds.get('468327359687426049').channels.get(config.votesChannelID).send(`\`\`\` \`\`\``, {
            message.channel.send(`\`\`\` \`\`\``, {
                embed
            }).then(m => {
                m.react(`✅`).then(() => m.react(`❌`));

                message.channel.fetchMessage(m.id).then(() => {
                    console.log(`Сообщение ID: ${m.id} получено`);
                });

                let notTimestamp = Date.now();

                new dbMessage({
                    id: m.id,
                    msgChannelID: m.channel.id,
                    in_favor: 1,
                    against: 0,
                    punishTime: punishTimeMs,
                    authorID: message.author.id,
                    punishableID: userForPunish.id,
                    resultsTime: notTimestamp + 600000,
                    punishReason: punishReason,
                    ended: false,
                    endedVoting: false,
                    in_favorIDs: message.author.id
                }).save();



                setTimeout(() => {

                    dbMessage.findOne({
                        punishableID: userForPunish.id,
                        endedVoting: false
                    }, function(err, msgs) {
                        msgs.endedVoting = true;
                        msgs.save();
                    });

                    dbMessage.findOne({
                        punishableID: userForPunish.id,
                        ended: false
                    }, function(err, msgs) {
                        if (msgs.in_favor > msgs.against) {

                            let titlesArray2 = [''];

                            if (lastSymbol == 'm' || lastSymbol == 'м') {
                                titlesArray2 = ['минуту', 'минуты', 'минут'];
                                let multNum = 60000;
                                let punishTime = parseInt(messageArray[2].slice(0, -1), 10);
                            } else if (lastSymbol == 'h' || lastSymbol == 'ч') {
                                titlesArray2 = ['час', 'часа', 'часов'];
                                let multNum = 3600000;
                                let punishTime = parseInt(messageArray[2].slice(0, -1), 10);
                            } else {
                                titlesArray2 = ['минуту', 'минуты', 'минут'];
                                let multNum = 60000;
                                let punishTime = parseInt(messageArray[2], 10);
                            }

                            let embed = new Discord.RichEmbed()
                                .addField(`Информация`, `**${userForPunish} был замучен на \`${punishTime}\` ${declOfNum(punishTime, titlesArray2)}**\n\n**Соотношение за/против: ${msgs.in_favor} \\✅/ ${msgs.against} \\❌**\n\n**Начал голосование:** ${message.author}`)
                                .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``)
                                .setColor(`#00D11A`)
                                .setFooter(`${m.guild.name}`)
                                .setTimestamp()

                            m.edit(`\`\`\` \`\`\``, {
                                embed
                            });

                            m.guild.members.get(userForPunish.id).addRole(config.muteRoleID);

                            let notTimestamp = Date.now();

                            msgs.unmuteTime = notTimestamp + msgs.punishTime;

                            msgs.save();
                            setTimeout(() => {
                                m.guild.members.get(userForPunish.id).removeRole(config.muteRoleID);

                                console.log(`${userForPunish.tag} был размучен`);
                            }, punishTime * 5000);
                            //}, punishTime * multNum);

                            m.clearReactions();

                        }

                        if (msgs.in_favor <= msgs.against) {
                            let embed = new Discord.RichEmbed()
                                .addField(`Информация`, `**${userForPunish} не был замучен\n\nСоотношение за/против: ${msgs.in_favor} \\✅/ ${msgs.against} \\❌\n\nНачал голосование: ${message.author}**`)
                                .setColor(`#F01717`)
                                .setFooter(`${m.guild.name}`)
                                .setTimestamp()

                            m.edit(`\`\`\` \`\`\``, {
                                embed
                            });

                            m.clearReactions();
                        }


                    });

                    dbMessage.findOne({
                        punishableID: userForPunish.id,
                        ended: false
                    }, function(err, msgs) {
                        msgs.ended = true;
                        msgs.save();
                    });
                }, 20000);
                //}, 600000);
            });


        }
    });

}

module.exports.help = {
    name: "votemute"
}
