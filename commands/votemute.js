const Discord = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");

const config = require("./config.json");
const client = new Discord.Client();
const Schema = mongoose.Schema;
const prefix = 'v.'

const messageSchema = new Schema({
    id: String,
    in_favor: Number,
    against: Number,
    punishTime: Number,
    unmuteTime: Number,
    resultsTime: Number,
    authorID: String,
    punishableID: String,
    punishReason: String
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
});

client.on('messageReactionAdd', (reaction, user) => {
    let reactionMember = reaction.message.guild.members.get(user.id);

    if (reaction.emoji.name == "✅" && reaction.message.channel == config.votesChannelID && !user.bot) {
        dbMessage.findOne({
            id: message.id
        }, function(err, msgs) {
            msgs.in_favor += 1;
            msgs.save();
        });

        let otherReactionUser = reaction.message.reactions.get('❌').users.get(user.id);

        if (otherReactionUser) {
            reaction.message.reactions.get('❌').remove(user.id);
        }
    }

    if (reaction.emoji.name == "❌" && reaction.message.channel == config.votesChannelID && !user.bot) {
        dbMessage.findOne({
            id: message.id
        }, function(err, msgs) {
            msgs.against += 1;
            msgs.save();
        });

        let otherReactionUser = reaction.message.reactions.get('✅').users.get(user.id);

        if (otherReactionUser) {
            reaction.message.reactions.get('✅').remove(user.id);
        }
    }

});

client.on('messageReactionRemove', (reaction, user) => {
    let reactionMember = reaction.message.guild.members.get(user.id);

    if (reaction.emoji.name == "✅" && reaction.message.channel == config.votesChannelID && !user.bot) {
        dbMessage.findOne({
            id: message.id
        }, function(err, msgs) {
            msgs.in_favor += 1;
            msgs.save();
        });
    }

    if (reaction.emoji.name == "❌" && reaction.message.channel == config.votesChannelID && !user.bot) {
        dbMessage.findOne({
            id: message.id
        }, function(err, msgs) {
            msgs.against -= 1;
            msgs.save();
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
