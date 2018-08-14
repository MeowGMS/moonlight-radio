const Discord = require("discord.js");
const config = require("../config.json");
const prefix = "v.";


module.exports.run = async (client, message, args, dbMessage) => {

    const messageArray = message.content.split(/\s+/g);
    const otherArgs = messageArray.slice(1);
    const command = messageArray[0].slice(prefix.length).toLowerCase();

    if (!message.member.roles.has(config.voteRoleID) && !message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`**❌ У Вас нет прав использовать данную команду**`).then(m => m.delete(5000));

    message.delete(300);

    let userForPunish = message.mentions.users.first();
    let punishTime = parseInt(messageArray[2], 10);
    let reasonArgCount = prefix.length + command.length + messageArray[1].length + messageArray[2].length + 3;
    let punishReason = message.content.slice(reasonArgCount);

    if (!userForPunish) return message.channel.send(`**\\❌ Юзер не найден**`).then(m => m.delete(5000));
    if (!punishTime) return message.channel.send(`**\\❗ Укажите время мута**`).then(m => m.delete(5000));
    if (!messageArray[3]) return message.channel.send(`**\\❗ Укажите причину мута**`).then(m => m.delete(5000));
    if (userForPunish.bot) return message.channel.send(`**\\❗ Невозможно замутить бота**`).then(m => m.delete(5000));
    if (message.guild.members.get(userForPunish.id).roles.has(config.muteRoleID)) return message.channel.send(`**\\❌ Пользователь уже замучен**`);
    //if (userForPunish.id == message.author.id) return message.channel.send(`**\\❌ Невозможно замутить самого себя**`).then(m => m.delete(5000));

    dbMessage.findOne({
        punishableID: userForPunish.id
    }).then((voting) => {
        if (voting) {
            return message.channel.send(`**\\❌ Голосование по поводу мута данного юзера уже запущено**`).then(m => m.delete(5000));
        } else {

            let embed = new Discord.RichEmbed()
                .setAuthor(`${message.author.tag}`, `${message.author.avatarURL}`)
                .addField(`Кого наказывают?`, `**Юзер:** ${userForPunish}\n**ID:** \`${userForPunish.id}\`\n**Тег:** \`${userForPunish.tag}\``, true)
                .addField(`Время мута`, `${punishTime} минут`, true)
                .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``)
                .setThumbnail(`${userForPunish.avatarURL}`)
                .setColor(`#36393E`)
                .setFooter(`${message.guild.name}`)
                .setTimestamp()

            client.guilds.get('468327359687426049').channels.get(config.votesChannelID).send(`\`\`\` \`\`\``, {
                embed
            }).then(m => {
                m.react(`✅`).then(() => m.react(`❌`));
                client.guilds.get('468327359687426049').channels.get('478567412028145685').fetchMessage(m.id).then(() => {
                    console.log(`Сообщение ID: ${m.id} получено`);
                });
                

                let notTimestamp = Date.now();

                new dbMessage({
                    id: m.id,
                    in_favor: 1,
                    against: 0,
                    punishTime: punishTime * 60000,
                    authorID: message.author.id,
                    punishableID: userForPunish.id,
                    resultsTime: notTimestamp + 600000,
                    punishReason: punishReason
                }).save().then(() => {
                    console.log(`db doc created`);
                });

                setTimeout(() => {
                    dbMessage.findOne({
                        punishableID: userForPunish.id
                    }, function(err, msgs) {
                        if (msgs.in_favor > msgs.against) {
                            let embed = new Discord.RichEmbed()
                                //.setAuthor(`${m.guild.name}`, `${m.guild.iconURL}`)
                                .addField(`Информация`, `${userForPunish} был замучен на \`${punishTime}\` **минут**\n\n**Соотношение за/против: ${msgs.in_favor} \\✅/ ${msgs.against} \\❌**\n\n**Начал голосование:** ${message.author}`)
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

                                dbMessage.deleteOne({
                                    punishableID: userForPunish.id
                                }).then(() => console.log(`db doc deleted`))
                            }, punishTime * 5000);
                            //}, punishTime * 60000);

                        } 

                        if (msgs.in_favor <= msgs.against) {
                            let embed = new Discord.RichEmbed()
                                //.setAuthor(`${m.guild.name}`, `${m.guild.iconURL}`)
                                .addField(`Информация`, `${userForPunish} не был замучен\n\n**Соотношение за/против: ${msgs.in_favor} \\✅/ ${msgs.against} \\❌**\n\n**Начал голосование:** ${message.author}`)
                                .setColor(`#F01717`)
                                .setFooter(`${m.guild.name}`)
                                .setTimestamp()

                            m.edit(`\`\`\` \`\`\``, {
                                embed
                            });
                        }
                    });
                }, 10000);
                //}, 600000);
            });


        }
    });

}

module.exports.help = {
    name: "votemute"
}
