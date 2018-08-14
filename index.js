const Discord = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");

const config = require("./config.json");
const client = new Discord.Client();
const Schema = mongoose.Schema;
const prefix = 'v.'

const messageSchema = new Schema({
    id: String,
    msgChannelID: String,
    letter: String,
    in_favor: Number,
    against: Number,
    punishTime: Number,
    unmuteTime: Number,
    resultsTime: Number,
    authorID: String,
    punishableID: String,
    punishReason: String,
    ended: Boolean,
    endedVoting: Boolean,
    in_favorIDs: [String],
    againstIDs: [String]
});
const dbMessage = mongoose.model('message', messageSchema);

client.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

    let commandCount = 0;

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Команда не найдена");
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

    client.guilds.get('468327359687426049').members.forEach((member) => {
        dbMessage.findOne({
            punishableID: member.user.id,
            endedVoting: true,
            ended: false
        }).then((voting) => {
            if (voting) {
                dbMessage.findOne({
                    punishableID: member.user.id,
                    ended: false
                }, function(err, msgs) {
                    if (nowTimeStamp >= msgs.unmuteTime) {
                        member.removeRole(config.muteRoleID);
                        console.log(`${member.user.tag} размучен`);
                        msgs.ended = true;
                        msgs.save()
                    } else {
                        member.addRole(config.muteRoleID)
                        setTimeout(() => {
                            member.removeRole(config.muteRoleID);
                            console.log(`${member.user.tag} был замучен и будет размучен через ${Math.round((msgs.unmuteTime - nowTimeStamp) / 1000)} секунд`);
                            msgs.ended = true;
                            msgs.save()
                        }, msgs.unmuteTime - nowTimeStamp);
                    }

                });
            }
        });

    });

    client.guilds.get('468327359687426049').members.forEach((member) => {
        dbMessage.findOne({
            punishableID: member.user.id,
            endedVoting: false
        }).then((voting) => {
            if (voting) {
                dbMessage.findOne({
                    punishableID: member.user.id,
                    endedVoting: false
                }, function(err, msgs) {

                    if (nowTimeStamp >= msgs.resultsTime) {
                        console.log(`Голосование закончено`);
                        let msg = client.channels.get(msgs.msgChannelID).fetchMessage(msgs.id);
                        let in_favorCount = msg.reactions.get('✅').count;
                        let againstCount = msg.reactions.get('❌').count;



                        setTimeout(() => {

                            dbMessage.findOne({
                                punishableID: member.user.id,
                                endedVoting: false
                            }, function(err, msgs) {
                                msgs.endedVoting = true;
                                msgs.save();
                            });

                            dbMessage.findOne({
                                punishableID: member.user.id,
                                ended: false
                            }, function(err, msgs) {
                                if (in_favorCount > againstCount) {

                                    let titlesArray2 = [''];

                                    if (msgs.letter == 'm' || msgs.letter == 'м') {
                                        titlesArray2 = ['минуту', 'минуты', 'минут'];
                                        let punishTime = msgs.punishTime;
                                    } else if (msgs.letter == 'h' || msgs.letter == 'ч') {
                                        titlesArray2 = ['час', 'часа', 'часов'];
                                        let punishTime = msgs.punishTime;
                                        
                                    } else {
                                        titlesArray2 = ['минуту', 'минуты', 'минут'];
                                        let punishTime = msgs.punishTime;
                                    }

                                    let embed = new Discord.RichEmbed()
                                        .addField(`Информация`, `**${member.user} был замучен на \`${msgs.punishTime}\` ${declOfNum(msgs.punishTime, titlesArray2)}**\n\n**Соотношение за/против: ${in_favorCount} \\✅/ ${against} \\❌**\n\n**Начал голосование:** ${msg.author}`)
                                        .addField(`Причина`, `\`\`\`fix\n${msgs.punishReason}\`\`\``)
                                        .setColor(`#00D11A`)
                                        .setFooter(`${msg.guild.name}`)
                                        .setTimestamp()

                                    msg.edit(`\`\`\` \`\`\``, {
                                        embed
                                    });

                                    msg.guild.members.get(member.user.id).addRole(config.muteRoleID);

                                    let notTimestamp = Date.now();

                                    msgs.unmuteTime = notTimestamp + msgs.punishTime;

                                    msgs.save();
                                    setTimeout(() => {
                                        msg.guild.members.get(msgs.punishableID).removeRole(config.muteRoleID);

                                        console.log(`${client.fetchUser(msgs.punishableID).tag} был размучен`);
                                    }, msgs.punishTime);

                                    msg.clearReactions();

                                }

                                if (in_favorCount <= againstCount) {
                                    let embed = new Discord.RichEmbed()
                                        .addField(`Информация`, `**${member.user} не был замучен\n\nСоотношение за/против: ${in_favorCount} \\✅/ ${againstCount} \\❌\n\nНачал голосование: ${msg.author}**`)
                                        .setColor(`#F01717`)
                                        .setFooter(`${msg.guild.name}`)
                                        .setTimestamp()

                                    msg.edit(`\`\`\` \`\`\``, {
                                        embed
                                    });

                                    msg.clearReactions();
                                }


                            });

                            dbMessage.findOne({
                                punishableID: member.user.id,
                                ended: false
                            }, function(err, msgs) {
                                msgs.against = againstCount;
                                msgs.in_favor = in_favorCount;
                                msgs.ended = true;
                                msgs.save();
                            });
                        }, 2000);

                    } else {
                        
                        

                        console.log(`Голосование запущено заного и будет закончено через ${Math.floor((msgs.resultsTime - nowTimeStamp) / 1000)} секунд`);
                        setTimeout(() => {

                            dbMessage.findOne({
                                punishableID: member.user.id,
                                endedVoting: false
                            }, function(err, msgs) {
                                msgs.endedVoting = true;
                                msgs.save();
                            });

                            dbMessage.findOne({
                                punishableID: member.user.id,
                                endedVoting: false
                            }, function(err, msgs) {
                                   let msg = client.channels.get(msgs.msgChannelID).fetchMessage(msgs.id);
                                   let in_favorCount = msg.reactions.get('✅').count;
                                   let againstCount = msg.reactions.get('❌').count;
                                
                                 msgs.against = againstCount;
                                msgs.in_favor = in_favorCount;
                                msgs.ended = true;
                                msgs.save();
                                
                                if (in_favorCount > againstCount) {
                                    

                                    let titlesArray2 = [''];

                                    if (msgs.letter == 'm' || msgs.letter == 'м') {
                                        titlesArray2 = ['минуту', 'минуты', 'минут'];
                                        let punishTime = msgs.punishTime;
                                    } else if (msgs.letter == 'h' || msgs.letter == 'ч') {
                                        titlesArray2 = ['час', 'часа', 'часов'];
                                        let punishTime = msgs.punishTime;
                                    } else {
                                        titlesArray2 = ['минуту', 'минуты', 'минут'];
                                        let punishTime = msgs.punishTime;
                                    }

                                    let embed = new Discord.RichEmbed()
                                        .addField(`Информация`, `**${member.user} был замучен на \`${msgs.punishTime}\` мс**\n\n**Соотношение за/против: ${in_favorCount} \\✅/ ${againstCount} \\❌**\n\n**Начал голосование:** ${msg.author}`)
                                        .addField(`Причина`, `\`\`\`fix\n${msgs.punishReason}\`\`\``)
                                        .setColor(`#00D11A`)
                                        .setFooter(`${msg.guild.name}`)
                                        .setTimestamp()

                                    msg.edit(`\`\`\` \`\`\``, {
                                        embed
                                    });

                                    msg.guild.members.get(member.user.id).addRole(config.muteRoleID);

                                    let notTimestamp = Date.now();

                                    msgs.unmuteTime = notTimestamp + msgs.punishTime;

                                    msgs.save();
                                    setTimeout(() => {
                                        msg.guild.members.get(msgs.punishableID).removeRole(config.muteRoleID);

                                        console.log(`${client.fetchUser(msgs.punishableID).tag} был размучен`);
                                    }, msgs.punishTime);

                                    msg.clearReactions();

                                }

                                if (in_favorCount <= againstCount) {
                                    let embed = new Discord.RichEmbed()
                                        .addField(`Информация`, `**${member.user} не был замучен\n\nСоотношение за/против: ${in_favorCount} \\✅/ ${againstCount} \\❌\n\nНачал голосование: ${msg.author}**`)
                                        .setColor(`#F01717`)
                                        .setFooter(`${msg.guild.name}`)
                                        .setTimestamp()

                                    msg.edit(`\`\`\` \`\`\``, {
                                        embed
                                    });

                                    msg.clearReactions();
                                }


                            });
                        }, msgs.resultsTime - nowTimeStamp);
                    }

                });
            }
        });

    });

});

client.on('messageReactionAdd', (reaction, user) => {
    let reactionMember = reaction.message.guild.members.get(user.id);

    if (reaction.emoji.name == "✅" && !user.bot && (reactionMember.roles.has(config.voteRoleID) || reactionMember.hasPermission('ADMINISTRATOR'))) {
        dbMessage.findOne({
            id: reaction.message.id,
            ended: false
        }).then(voting => {
            if (voting) {
                dbMessage.findOne({
                    id: reaction.message.id,
                    ended: false
                }, function(err, msgs) {

                    if (msgs.authorID == reactionMember.user.id) return reaction.remove(reactionMember.user.id);
                    if (msgs.punishableID == reactionMember.user.id) return reaction.remove(reactionMember.user.id);

                    msgs.in_favor += 1;
                    msgs.save();
                });
            } else {
                return;
            }
        });

        let otherReactionUser = reaction.message.reactions.get('❌').users.get(user.id);

        if (otherReactionUser) {
            reaction.message.reactions.get('❌').remove(user.id);
        }
    }

    if (reaction.emoji.name == "❌" && !user.bot && (reactionMember.roles.has(config.voteRoleID) || reactionMember.hasPermission('ADMINISTRATOR'))) {
        dbMessage.findOne({
            id: reaction.message.id,
            ended: false
        }).then(voting => {
            if (voting) {
                dbMessage.findOne({
                    id: reaction.message.id
                }, function(err, msgs) {

                    if (msgs.authorID == reactionMember.user.id) return reaction.remove(reactionMember.user.id);
                    if (msgs.punishableID == reactionMember.user.id) return reaction.remove(reactionMember.user.id);

                    msgs.against += 1;
                    msgs.save();
                });
            } else {
                return;
            }
        });

        let otherReactionUser = reaction.message.reactions.get('✅').users.get(user.id);

        if (otherReactionUser) {
            reaction.message.reactions.get('✅').remove(user.id);
        }
    }

});

client.on('messageReactionRemove', (reaction, user) => {
    let reactionMember = reaction.message.guild.members.get(user.id);

    if (reaction.emoji.name == "✅" && !user.bot && (reactionMember.roles.has(config.voteRoleID) || reactionMember.hasPermission('ADMINISTRATOR'))) {
        dbMessage.findOne({
            id: reaction.message.id,
            ended: false
        }).then((voting) => {
            if (voting) {
                dbMessage.findOne({
                    id: reaction.message.id,
                    ended: false
                }, function(err, msgs) {

                    if (msgs.authorID == reactionMember.user.id) return reaction.remove(reactionMember.user.id);
                    if (msgs.punishableID == reactionMember.user.id) return reaction.remove(reactionMember.user.id);

                    msgs.in_favor -= 1;
                    msgs.save();
                });
            } else return;
        });

    }

    if (reaction.emoji.name == "❌" && !user.bot && (reactionMember.roles.has(config.voteRoleID) || reactionMember.hasPermission('ADMINISTRATOR'))) {
        dbMessage.findOne({
            id: reaction.message.id,
            ended: false
        }).then((voting) => {
            if (voting) {
                dbMessage.findOne({
                    id: reaction.message.id,
                    ended: false
                }, function(err, msgs) {
                    if (msgs.authorID == reactionMember.user.id) return reaction.remove(reactionMember.user.id);
                    if (msgs.punishableID == reactionMember.user.id) return reaction.remove(reactionMember.user.id);

                    msgs.against -= 1;
                    msgs.save();
                });
            } else return;
        });
    }
});

client.on("message", async message => {

    if (!message.content.startsWith(prefix)) return;

    let messageArray = message.content.split(/\s+/g);
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    let commandfile = client.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(client, message, args, dbMessage);
});

client.login(process.env.token).catch(console.error);
