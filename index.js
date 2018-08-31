const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const config = require('./config.json')
const prefix = config.prefix;

let cooldown = new Set();

client.commands = new Discord.Collection();

client.on(`ready`, () => {
    console.log(` - ${client.user.username} онлайн на ${client.guilds.size} серверах!\n\n======================================`);
});

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

client.on('message', message => {

    if (message.channel.id != '401098551972593665') return;
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
    if (commandfile) commandfile.run(client, message, args);

});


client.login(process.env.token);
