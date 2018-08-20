const Discord = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");

const config = require("./config.json");
const client = new Discord.Client();
const Schema = mongoose.Schema;
const prefix = 'v.';

let cooldown = new Set();

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
    againstIDs: [String],
    nextUseCommandTime: Number
});
const dbMessage = mongoose.model('message', messageSchema);

const userSchema = new Schema({
    id: String,
    nextUseCommandTime: Number
});
const User = mongoose.model('users', userSchema);

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

    console.log(`Время сейчас: ${nowTimeStamp}`);

});

client.on('voiceStateUpdate', (oldMember, newMember) => {

    if (oldMember.user.bot || newMember.user.bot) return;

    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;

    let privateCategory = client.channels.get(config.privateCategoryID);

    let mlGuild = client.guilds.get('199181202383568896');

    if (newUserChannel != undefined && oldUserChannel == undefined) {

        if (newUserChannel.id == config.createPrivateChannelID) {

            mlGuild.createChannel('Private', "voice", [{
                id: newMember.user,
                allow: ['CREATE_INSTANT_INVITE', 'VIEW_CHANNEL', 'USE_VAD', 'MANAGE_CHANNELS'],
                deny: ['MANAGE_ROLES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS']
            }, {
                id: newMember.guild.id,
                allow: ['CREATE_INSTANT_INVITE', 'VIEW_CHANNEL', 'USE_VAD'],
                deny: ['MANAGE_ROLES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_CHANNELS']
            }, {
                id: '383751438565769216',
                deny: ['SPEAK']
            }, {
                id: '368090830990344192',
                deny: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD']
            }, {
                id: '426236825997148160',
                allow: ['MANAGE_CHANNELS'],
                deny: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS']
            }]).then((channel) => {
                channel.setParent(privateCategory).catch(console.error);
                channel.setBitrate(128).catch(console.error);
                if (newUserChannel) {
                    newMember.setVoiceChannel(channel.id).catch(console.error);
                }

            }).catch(console.error);
        }

    }

    if (newUserChannel == undefined && oldUserChannel != undefined) {

        if ((oldUserChannel.parentID == config.privateCategoryID) && (oldUserChannel.id != config.createPrivateChannelID)) {

            let voiceCount = 0;

            oldUserChannel.members.forEach((voiceUser) => {
                voiceCount++;
            })

            if (voiceCount == 0) {
                oldUserChannel.delete().catch(console.error);
            }
        }

    }

    if (newUserChannel != undefined && oldUserChannel != undefined) {
        if ((oldUserChannel.parentID === config.privateCategoryID) && (oldUserChannel.id != config.createPrivateChannelID)) {

            let voiceCount = 0;

            oldUserChannel.members.forEach((voiceUser) => {
                voiceCount++;
            })

            if (voiceCount == 0) {
                oldUserChannel.delete().catch(console.error);
            }
        }


        if (newUserChannel.id == config.createPrivateChannelID) {

            mlGuild.createChannel('Private', "voice", [{
                id: newMember.user,
                allow: ['CREATE_INSTANT_INVITE', 'VIEW_CHANNEL', 'USE_VAD', 'MANAGE_CHANNELS'],
                deny: ['MANAGE_ROLES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS']
            }, {
                id: newMember.guild.id,
                allow: ['CREATE_INSTANT_INVITE', 'VIEW_CHANNEL', 'USE_VAD'],
                deny: ['MANAGE_ROLES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_CHANNELS']
            }, {
                id: '383751438565769216',
                deny: ['SPEAK']
            }, {
                id: '368090830990344192',
                deny: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'VIEW_CHANNEL', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD']
            }, {
                id: '426236825997148160',
                allow: ['MANAGE_CHANNELS'],
                deny: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS']
            }]).then((channel) => {
                channel.setParent(privateCategory).catch(console.error);
                channel.setBitrate(128).catch(console.error);
                if (newUserChannel) {
                    newMember.setVoiceChannel(channel.id).catch(console.error);
                }

            }).catch(console.error);
        }
    }


});


client.on('messageReactionAdd', (reaction, user) => {
    let reactionMember = reaction.message.guild.members.get(user.id);

    if (reaction.emoji.name == "✅" && !user.bot) {
        dbMessage.findOne({
            id: reaction.message.id,
            ended: false
        }).then(voting => {
            if (voting) {
                dbMessage.findOne({
                    id: reaction.message.id,
                    ended: false
                }, function(err, msgs) {

                    if (msgs.authorID == reactionMember.user.id) return reaction.remove(reactionMember.user.id).catch(console.error);
                    if (msgs.punishableID == reactionMember.user.id) return reaction.remove(reactionMember.user.id).catch(console.error);

                    msgs.in_favor += 1;
                    msgs.save();
                });
                
                let againstReaction = reaction.message.reactions.get('❌');
                
                if (againstReaction) {
                    let otherReactionUser = reaction.message.reactions.get('❌').users.get(user.id);

                    if (otherReactionUser) {
                        reaction.message.reactions.get('❌').remove(user.id).catch(console.error);
                    }
                }  
                
            } else return;
        });

        
    } else if (reaction.emoji.name == "❌" && !user.bot) {
        dbMessage.findOne({
            id: reaction.message.id,
            ended: false
        }).then(voting => {
            if (voting) {
                dbMessage.findOne({
                    id: reaction.message.id
                }, function(err, msgs) {

                    if (msgs.authorID == reactionMember.user.id) return reaction.remove(reactionMember.user.id).catch(console.error);
                    if (msgs.punishableID == reactionMember.user.id) return reaction.remove(reactionMember.user.id).catch(console.error);

                    msgs.against += 1;
                    msgs.save();
                });
                
                let otherReactionUser = reaction.message.reactions.get('✅').users.get(user.id);

                if (otherReactionUser) {
                  reaction.message.reactions.get('✅').remove(user.id).catch(console.error);
                }
            } else {
                return;
            }
        });
    }

});

client.on('messageReactionRemove', (reaction, user) => {
    let reactionMember = reaction.message.guild.members.get(user.id);

    if (reaction.emoji.name == "✅" && !user.bot) {
        dbMessage.findOne({
            id: reaction.message.id,
            ended: false
        }).then((voting) => {
            if (voting) {
                dbMessage.findOne({
                    id: reaction.message.id,
                    ended: false
                }, function(err, msgs) {

                    if (msgs.authorID == reactionMember.user.id) return reaction.remove(reactionMember.user.id).catch(console.error);
                    if (msgs.punishableID == reactionMember.user.id) return reaction.remove(reactionMember.user.id).catch(console.error);

                    msgs.in_favor -= 1;
                    msgs.save();
                });
            } else return;
        });

    } else if (reaction.emoji.name == "❌" && !user.bot) {
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

client.on('guildMemberRemove', async member => {
    let memberChannel = member.voiceChannel;
    
    if (memberChannel) {
        if ((memberChannel.parentID == config.privateCategoryID) && (memberChannel.id != config.createPrivateChannelID)) {

            let voiceCount = 0;

            memberChannel.members.forEach((voiceUser) => {
                voiceCount++;
            })

            if (voiceCount == 0) {
                memberChannel.delete().catch(console.error);
            } 
        }
    }
    
    
});

client.on("message", async message => {

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

    let commandfile = client.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(client, message, args, dbMessage, User);
});

client.login(process.env.token).catch(console.error);
