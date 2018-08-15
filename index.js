const Discord = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");

const config = require("./config.json");
const client = new Discord.Client();
const Schema = mongoose.Schema;
const prefix = 'v.'

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

    /*client.guilds.get('199181202383568896').members.forEach((member) => {
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
    }); */


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
            } else return;
        });

        let otherReactionUser = reaction.message.reactions.get('❌').users.get(user.id);

        if (otherReactionUser) {
            reaction.message.reactions.get('❌').remove(user.id);
        }
    } else if (reaction.emoji.name == "❌" && !user.bot && (reactionMember.roles.has(config.voteRoleID) || reactionMember.hasPermission('ADMINISTRATOR'))) {
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

    } else if (reaction.emoji.name == "❌" && !user.bot && (reactionMember.roles.has(config.voteRoleID) || reactionMember.hasPermission('ADMINISTRATOR'))) {
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
