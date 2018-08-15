const Discord = require("discord.js");
const config = require("../config.json");
const prefix = "v.";


module.exports.run = async (client, message, args, dbMessage, User) => {

    const messageArray = message.content.split(/\s+/g);
    const otherArgs = messageArray.slice(1);
    const command = messageArray[0].slice(prefix.length).toLowerCase();

    function declOfNum(number, titles) {
        cases = [2, 0, 1, 1, 1, 2];
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    }

    if (!message.member.roles.has(config.voteRoleID) && !message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`**❌ У Вас нет прав использовать данную команду**`).then(m => m.delete(5000));

    message.delete(300);

    let titlesArray = ['минута', 'минуты', 'минут'];

    let userForPunish = message.mentions.users.first();
    let punishTime = parseInt(messageArray[2], 10);
    let reasonArgCount = prefix.length + command.length + messageArray[1].length + messageArray[2].length + 3;
    let punishReason = message.content.slice(reasonArgCount);

    if (!userForPunish) return message.channel.send(`**\\❌ Юзер не найден**`).then(m => m.delete(5000));
    if (!punishTime) return message.channel.send(`**\\❗ Укажите время мута**`).then(m => m.delete(5000));
    if (punishTime < 1 || punishTime > 30) return message.channel.send(`**\\❗ Время мута - от 1 до 30 минут**`).then(m => m.delete(5000));
    if (userForPunish.bot) return message.channel.send(`**\\❗ Невозможно замутить бота**`).then(m => m.delete(5000));
    if (message.guild.members.get(userForPunish.id).roles.has(config.muteRoleID)) return message.channel.send(`**\\❌ Пользователь уже замучен**`).then(m => m.delete(5000));
    if (userForPunish.id == message.author.id) return message.channel.send(`**\\❌ Невозможно замутить самого себя**`).then(m => m.delete(5000));

    let punishTimeMs = punishTime * 60000;

    if (!messageArray[3]) {
        punishReason = 'Без причины';
    }

    dbMessage.findOne({
        punishableID: userForPunish.id,
        ended: false
    }).then((voting) => {
        if (voting) {
            return message.channel.send(`**\\❌ Голосование по поводу мута данного юзера уже запущено**`).then(m => m.delete(5000));
        } else {


            User.findOne({
                id: message.author.id
            }).then((user) => {
                if (user) {
                    let nowTimestamp = Date.now();

                    User.findOne({
                        id: message.author.id
                    }, function(err, users) {

                        let nowTimeStamp = Date.now()

                        if (users.nextUseCommandTime > nowTimeStamp) {

                            let cooldown = users.nextUseCommandTime - nowTimeStamp;


                                var hours = cooldown / (1000 * 60 * 60);
                                var absoluteHours = Math.floor(hours);
                                var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

                                var minutes = (hours - absoluteHours) * 60;
                                var absoluteMinutes = Math.floor(minutes);
                                var m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;

                                var seconds = (minutes - absoluteMinutes) * 60;
                                var absoluteSeconds = Math.floor(seconds);
                                var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;

                                return message.channel.send(`**Для повторного использования команды вам осталось ${m}м ${s}с**`).then(m => m.delete(500));

                        } else {
                            users.nextUseCommandTime = nowTimeStamp + 600000;
                            users.save();
    
    
                            let embed = new Discord.RichEmbed()
                                .setAuthor(`${message.author.tag}`, `${message.author.avatarURL}`)
                                .addField(`Кого наказывают?`, `${userForPunish}`, true)
                                .addField(`Время мута`, `${punishTime} ${declOfNum(punishTime, titlesArray)}`, true)
                                .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``)
                                .setThumbnail(`${userForPunish.avatarURL}`)
                                .setColor(`#36393E`)
                                .setFooter(`${message.guild.name}`)
                                .setTimestamp()
    
                            message.channel.send(`\`\`\` \`\`\``, {
                                embed
                            }).then(m => {
                                m.react(`✅`).then(() => m.react(`❌`));
    
                                message.channel.fetchMessage(m.id).then(() => {
                                    console.log(`Сообщение ID: ${m.id} получено`);
                                });
    
    
    
                                new dbMessage({
                                    id: m.id,
                                    msgChannelID: m.channel.id,
                                    in_favor: 1,
                                    against: 0,
                                    punishTime: punishTimeMs,
                                    authorID: message.author.id,
                                    punishableID: userForPunish.id,
                                    resultsTime: nowTimestamp + 30000,
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
    
                                            let titlesArray2 = ['минута', 'минуты', 'минут'];
                                            let punishTime = parseInt(messageArray[2], 10);
    
                                            let embed = new Discord.RichEmbed()
                                                .addField(`Информация`, `**${userForPunish} лишился прав общаться в голосовых и текстовых каналах**\n\n**Начал голосование:** ${message.author}`)
                                                .addField(`За \\✅`, `${msgs.in_favor}`, true)
                                                .addField(`Против \\❌`, `${msgs.against}`, true)
                                                .addField(`Время`, `${punishTime} ${declOfNum(punishTime, titlesArray2)}`, true)
                                                .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``, true)
                                                .setColor(`#00D11A`)
                                                .setThumbnail(`${userForPunish.avatarURL}`)
                                                .setFooter(`${m.guild.name}`)
                                                .setTimestamp()
    
                                            m.edit({
                                                embed
                                            });
    
                                            m.guild.members.get(userForPunish.id).addRole(config.muteRoleID);
    
                                            let nowTimestamp = Date.now();
    
                                            msgs.unmuteTime = nowTimestamp + msgs.punishTime;
    
                                            msgs.save();
                                            setTimeout(() => {
                                                m.guild.members.get(userForPunish.id).removeRole(config.muteRoleID);
    
                                                console.log(`${userForPunish.tag} был размучен`);
    
                                                dbMessage.findOne({
                                                    punishableID: userForPunish.id,
                                                    ended: false
                                                }, function(err, msgs) {
                                                    msgs.ended = true;
                                                    msgs.save();
                                                });
                                            }, punishTimeMs);
    
                                            m.clearReactions();
    
                                        }
    
                                        if (msgs.in_favor <= msgs.against) {
                                            let embed = new Discord.RichEmbed()
                                                .addField(`Информация`, `**Для мута ${userForPunish} недостаточно голосов\n\nНачал голосование: ${message.author}**`)
                                                .addField(`За ✅`, `${msgs.in_favor}`, true)
                                                .addField(`Против`, `${msgs.against}`, true)
                                                .setColor(`#F01717`)
                                                .setFooter(`${m.guild.name}`)
                                                .setTimestamp()
                                                .setThumbnail(`${userForPunish.avatarURL}`)
    
                                            m.edit({
                                                embed
                                            });
    
                                            m.clearReactions();
                                        }
    
                                    });
    
    
    
                                }, 30000);
                            });
                        }

                    });

                } else {


                    let nowTimestamp = Date.now();

                    new User({
                        id: message.author.id,
                        nextUseCommandTime: nowTimestamp + 600000
                    }).save().then(() => console.log(`Аккаунт ${message.author.tag} создан`));

                    setTimeout(function() {



                        let embed = new Discord.RichEmbed()
                            .setAuthor(`${message.author.tag}`, `${message.author.avatarURL}`)
                            .addField(`Кого наказывают?`, `${userForPunish}`, true)
                            .addField(`Время мута`, `${punishTime} ${declOfNum(punishTime, titlesArray)}`, true)
                            .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``)
                            .setThumbnail(`${userForPunish.avatarURL}`)
                            .setColor(`#36393E`)
                            .setFooter(`${message.guild.name}`)
                            .setTimestamp()

                        message.channel.send(`\`\`\` \`\`\``, {
                            embed
                        }).then(m => {
                            m.react(`✅`).then(() => m.react(`❌`));

                            message.channel.fetchMessage(m.id).then(() => {
                                console.log(`Сообщение ID: ${m.id} получено`);
                            });



                            new dbMessage({
                                id: m.id,
                                msgChannelID: m.channel.id,
                                in_favor: 1,
                                against: 0,
                                punishTime: punishTimeMs,
                                authorID: message.author.id,
                                punishableID: userForPunish.id,
                                resultsTime: nowTimestamp + 30000,
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

                                        let titlesArray2 = ['минута', 'минуты', 'минут'];
                                        let punishTime = parseInt(messageArray[2], 10);

                                        let embed = new Discord.RichEmbed()
                                            .addField(`Информация`, `**${userForPunish} лишился прав общаться в голосовых и текстовых каналах**\n\n**Начал голосование:** ${message.author}`)
                                            .addField(`За \\✅`, `${msgs.in_favor}`, true)
                                            .addField(`Против \\❌`, `${msgs.against}`, true)
                                            .addField(`Время`, `${punishTime} ${declOfNum(punishTime, titlesArray2)}`, true)
                                            .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``, true)
                                            .setColor(`#00D11A`)
                                            .setThumbnail(`${userForPunish.avatarURL}`)
                                            .setFooter(`${m.guild.name}`)
                                            .setTimestamp()

                                        m.edit({
                                            embed
                                        });

                                        m.guild.members.get(userForPunish.id).addRole(config.muteRoleID);

                                        let nowTimestamp = Date.now();

                                        msgs.unmuteTime = nowTimestamp + msgs.punishTime;

                                        msgs.save();
                                        setTimeout(() => {
                                            m.guild.members.get(userForPunish.id).removeRole(config.muteRoleID);

                                            console.log(`${userForPunish.tag} был размучен`);

                                            dbMessage.findOne({
                                                punishableID: userForPunish.id,
                                                ended: false
                                            }, function(err, msgs) {
                                                msgs.ended = true;
                                                msgs.save();
                                            });
                                        }, punishTimeMs);

                                        m.clearReactions();

                                    }

                                    if (msgs.in_favor <= msgs.against) {
                                        let embed = new Discord.RichEmbed()
                                            .addField(`Информация`, `**Для мута ${userForPunish} недостаточно голосов\n\nНачал голосование: ${message.author}**`)
                                            .addField(`За ✅`, `${msgs.in_favor}`, true)
                                            .addField(`Против`, `${msgs.against}`, true)
                                            .setColor(`#F01717`)
                                            .setFooter(`${m.guild.name}`)
                                            .setTimestamp()
                                            .setThumbnail(`${userForPunish.avatarURL}`)

                                        m.edit({
                                            embed
                                        });

                                        m.clearReactions();
                                    }

                                });


                            }, 30000);
                        });
                    }, 500);
                }
            });

        }
    });

}

module.exports.help = {
    name: "votemute"
}
const Discord = require("discord.js");
const config = require("../config.json");
const prefix = "v.";


module.exports.run = async (client, message, args, dbMessage, User) => {

    const messageArray = message.content.split(/\s+/g);
    const otherArgs = messageArray.slice(1);
    const command = messageArray[0].slice(prefix.length).toLowerCase();

    function declOfNum(number, titles) {
        cases = [2, 0, 1, 1, 1, 2];
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
    }

    if (!message.member.roles.has(config.voteRoleID) && !message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`**❌ У Вас нет прав использовать данную команду**`).then(m => m.delete(5000));

    message.delete(300);

    let titlesArray = ['минута', 'минуты', 'минут'];

    let userForPunish = message.mentions.users.first();
    let punishTime = parseInt(messageArray[2], 10);
    let reasonArgCount = prefix.length + command.length + messageArray[1].length + messageArray[2].length + 3;
    let punishReason = message.content.slice(reasonArgCount);

    if (!userForPunish) return message.channel.send(`**\\❌ Юзер не найден**`).then(m => m.delete(5000));
    if (!punishTime) return message.channel.send(`**\\❗ Укажите время мута**`).then(m => m.delete(5000));
    if (punishTime < 1 || punishTime > 30) return message.channel.send(`**\\❗ Время мута - от 1 до 30 минут**`).then(m => m.delete(5000));
    if (userForPunish.bot) return message.channel.send(`**\\❗ Невозможно замутить бота**`).then(m => m.delete(5000));
    if (message.guild.members.get(userForPunish.id).roles.has(config.muteRoleID)) return message.channel.send(`**\\❌ Пользователь уже замучен**`).then(m => m.delete(5000));
    if (userForPunish.id == message.author.id) return message.channel.send(`**\\❌ Невозможно замутить самого себя**`).then(m => m.delete(5000));

    let punishTimeMs = punishTime * 60000;

    if (!messageArray[3]) {
        punishReason = 'Без причины';
    }

    dbMessage.findOne({
        punishableID: userForPunish.id,
        ended: false
    }).then((voting) => {
        if (voting) {
            return message.channel.send(`**\\❌ Голосование по поводу мута данного юзера уже запущено**`).then(m => m.delete(5000));
        } else {


            User.findOne({
                id: message.author.id
            }).then((user) => {
                if (user) {
                    let nowTimestamp = Date.now();

                    User.findOne({
                        id: message.author.id
                    }, function(err, users) {

                        let nowTimeStamp = Date.now()

                        if (users.nextUseCommandTime > nowTimeStamp) {

                            let cooldown = users.nextUseCommandTime - nowTimeStamp;


                                var hours = cooldown / (1000 * 60 * 60);
                                var absoluteHours = Math.floor(hours);
                                var h = absoluteHours > 9 ? absoluteHours : '0' + absoluteHours;

                                var minutes = (hours - absoluteHours) * 60;
                                var absoluteMinutes = Math.floor(minutes);
                                var m = absoluteMinutes > 9 ? absoluteMinutes : '0' + absoluteMinutes;

                                var seconds = (minutes - absoluteMinutes) * 60;
                                var absoluteSeconds = Math.floor(seconds);
                                var s = absoluteSeconds > 9 ? absoluteSeconds : '0' + absoluteSeconds;

                                return message.channel.send(`**Для повторного использования команды вам осталось ${m}м ${s}с**`).then(m => m.delete(500));

                        } else {
                            users.nextUseCommandTime = nowTimeStamp + 600000;
                            users.save();
    
    
                            let embed = new Discord.RichEmbed()
                                .setAuthor(`${message.author.tag}`, `${message.author.avatarURL}`)
                                .addField(`Кого наказывают?`, `${userForPunish}`, true)
                                .addField(`Время мута`, `${punishTime} ${declOfNum(punishTime, titlesArray)}`, true)
                                .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``)
                                .setThumbnail(`${userForPunish.avatarURL}`)
                                .setColor(`#36393E`)
                                .setFooter(`${message.guild.name}`)
                                .setTimestamp()
    
                            message.channel.send(`\`\`\` \`\`\``, {
                                embed
                            }).then(m => {
                                m.react(`✅`).then(() => m.react(`❌`));
    
                                message.channel.fetchMessage(m.id).then(() => {
                                    console.log(`Сообщение ID: ${m.id} получено`);
                                });
    
    
    
                                new dbMessage({
                                    id: m.id,
                                    msgChannelID: m.channel.id,
                                    in_favor: 1,
                                    against: 0,
                                    punishTime: punishTimeMs,
                                    authorID: message.author.id,
                                    punishableID: userForPunish.id,
                                    resultsTime: nowTimestamp + 30000,
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
    
                                            let titlesArray2 = ['минута', 'минуты', 'минут'];
                                            let punishTime = parseInt(messageArray[2], 10);
    
                                            let embed = new Discord.RichEmbed()
                                                .addField(`Информация`, `**${userForPunish} лишился прав общаться в голосовых и текстовых каналах**\n\n**Начал голосование:** ${message.author}`)
                                                .addField(`За \\✅`, `${msgs.in_favor}`, true)
                                                .addField(`Против \\❌`, `${msgs.against}`, true)
                                                .addField(`Время`, `${punishTime} ${declOfNum(punishTime, titlesArray2)}`, true)
                                                .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``, true)
                                                .setColor(`#00D11A`)
                                                .setThumbnail(`${userForPunish.avatarURL}`)
                                                .setFooter(`${m.guild.name}`)
                                                .setTimestamp()
    
                                            m.edit({
                                                embed
                                            });
    
                                            m.guild.members.get(userForPunish.id).addRole(config.muteRoleID);
    
                                            let nowTimestamp = Date.now();
    
                                            msgs.unmuteTime = nowTimestamp + msgs.punishTime;
    
                                            msgs.save();
                                            setTimeout(() => {
                                                m.guild.members.get(userForPunish.id).removeRole(config.muteRoleID);
    
                                                console.log(`${userForPunish.tag} был размучен`);
    
                                                dbMessage.findOne({
                                                    punishableID: userForPunish.id,
                                                    ended: false
                                                }, function(err, msgs) {
                                                    msgs.ended = true;
                                                    msgs.save();
                                                });
                                            }, punishTimeMs);
    
                                            m.clearReactions();
    
                                        }
    
                                        if (msgs.in_favor <= msgs.against) {
                                            let embed = new Discord.RichEmbed()
                                                .addField(`Информация`, `**Для мута ${userForPunish} недостаточно голосов\n\nНачал голосование: ${message.author}**`)
                                                .addField(`За ✅`, `${msgs.in_favor}`, true)
                                                .addField(`Против`, `${msgs.against}`, true)
                                                .setColor(`#F01717`)
                                                .setFooter(`${m.guild.name}`)
                                                .setTimestamp()
                                                .setThumbnail(`${userForPunish.avatarURL}`)
    
                                            m.edit({
                                                embed
                                            });
    
                                            m.clearReactions();
                                        }
    
                                    });
    
    
    
                                }, 30000);
                            });
                        }

                    });

                } else {


                    let nowTimestamp = Date.now();

                    new User({
                        id: message.author.id,
                        nextUseCommandTime: nowTimestamp + 600000
                    }).save().then(() => console.log(`Аккаунт ${message.author.tag} создан`));

                    setTimeout(function() {



                        let embed = new Discord.RichEmbed()
                            .setAuthor(`${message.author.tag}`, `${message.author.avatarURL}`)
                            .addField(`Кого наказывают?`, `${userForPunish}`, true)
                            .addField(`Время мута`, `${punishTime} ${declOfNum(punishTime, titlesArray)}`, true)
                            .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``)
                            .setThumbnail(`${userForPunish.avatarURL}`)
                            .setColor(`#36393E`)
                            .setFooter(`${message.guild.name}`)
                            .setTimestamp()

                        message.channel.send(`\`\`\` \`\`\``, {
                            embed
                        }).then(m => {
                            m.react(`✅`).then(() => m.react(`❌`));

                            message.channel.fetchMessage(m.id).then(() => {
                                console.log(`Сообщение ID: ${m.id} получено`);
                            });



                            new dbMessage({
                                id: m.id,
                                msgChannelID: m.channel.id,
                                in_favor: 1,
                                against: 0,
                                punishTime: punishTimeMs,
                                authorID: message.author.id,
                                punishableID: userForPunish.id,
                                resultsTime: nowTimestamp + 30000,
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

                                        let titlesArray2 = ['минута', 'минуты', 'минут'];
                                        let punishTime = parseInt(messageArray[2], 10);

                                        let embed = new Discord.RichEmbed()
                                            .addField(`Информация`, `**${userForPunish} лишился прав общаться в голосовых и текстовых каналах**\n\n**Начал голосование:** ${message.author}`)
                                            .addField(`За \\✅`, `${msgs.in_favor}`, true)
                                            .addField(`Против \\❌`, `${msgs.against}`, true)
                                            .addField(`Время`, `${punishTime} ${declOfNum(punishTime, titlesArray2)}`, true)
                                            .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``, true)
                                            .setColor(`#00D11A`)
                                            .setThumbnail(`${userForPunish.avatarURL}`)
                                            .setFooter(`${m.guild.name}`)
                                            .setTimestamp()

                                        m.edit({
                                            embed
                                        });

                                        m.guild.members.get(userForPunish.id).addRole(config.muteRoleID);

                                        let nowTimestamp = Date.now();

                                        msgs.unmuteTime = nowTimestamp + msgs.punishTime;

                                        msgs.save();
                                        setTimeout(() => {
                                            m.guild.members.get(userForPunish.id).removeRole(config.muteRoleID);

                                            console.log(`${userForPunish.tag} был размучен`);

                                            dbMessage.findOne({
                                                punishableID: userForPunish.id,
                                                ended: false
                                            }, function(err, msgs) {
                                                msgs.ended = true;
                                                msgs.save();
                                            });
                                        }, punishTimeMs);

                                        m.clearReactions();

                                    }

                                    if (msgs.in_favor <= msgs.against) {
                                        let embed = new Discord.RichEmbed()
                                            .addField(`Информация`, `**Для мута ${userForPunish} недостаточно голосов\n\nНачал голосование: ${message.author}**`)
                                            .addField(`За ✅`, `${msgs.in_favor}`, true)
                                            .addField(`Против`, `${msgs.against}`, true)
                                            .setColor(`#F01717`)
                                            .setFooter(`${m.guild.name}`)
                                            .setTimestamp()
                                            .setThumbnail(`${userForPunish.avatarURL}`)

                                        m.edit({
                                            embed
                                        });

                                        m.clearReactions();
                                    }

                                });


                            }, 30000);
                        });
                    }, 500);
                }
            });

        }
    });

}

module.exports.help = {
    name: "votemute"
}
