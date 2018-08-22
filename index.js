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
    usersVotes: {
        id: String,
        username: String,
        votes: Number,
        voteAuthorUsername: [String],
        voteAuthorID: [String]
    },
    ended: Boolean
});
const bossMessage = mongoose.model('boss-message', bossMessageSchema);

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
            .setDescription(`**Голосования ещё не было. Начните его первыми**\n\n**Для начала нужно:\n • 10 человек в войсе\n • Должно пройти 4 часа с прошлого голосования**\nЕсли вы покинете войс, то ваш голос обнулится`)
            .setFooter(`Moonlight | Trash Boss`)
        message.channel.send({
            embed
        })
    }

    if (cmd == '+') {
        let user = message.mentions.users.first();

        bossMessage.findOne({
            usersVotes: {
                id: userID.id
            },
            ended: false
        }).then((user) => {
            if (user) {

                bossMessage.findOne({
                    ended: false
                }, function(err, msg) {

                    for (let i = 0; i < msg.usersVotes.length; i++) {
                        if (userID == msg.usersVotes[i][0]) {
                            if (msg.usersVotes[i][2] != undefined) {
                                msg.usersVotes[i][2] += 1;
                            } else {
                                msg.usersVotes[i][2] = 1;
                            }
                        }
                    }

                    //bossMessage =
                });
            } else {

            }
        });
    }

    let commandfile = client.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(client, message, args, dbMessage, User);
});

client.login(process.env.token).catch(console.error);
