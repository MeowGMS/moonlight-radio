const Discord = require("discord.js");
const client = new Discord.Client()
const config = require("../config.json");
const prefix = config.prefix;

let embed = new Discord.RichEmbed();

module.exports.stationNotFound = (channel, message) => {
    embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`,`${message.guild.iconURL}`)
        .addField(`Ошибка`,`**Радиостанция не найдена**\n\nСписок доступных: \`${prefix}stations\``)
        .setColor(config.redColor)
        .setFooter(`Автор команды - ${message.author.tag}`)
        .setTimestamp()
    channel.send({ embed }).then(m => m.delete(10000));
}

module.exports.userNotInChannel = (channel, message) => {
    embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`,`${message.guild.iconURL}`)
        .addField(`Ошибка`,`**Вы должны находится в голосовом канале, чтобы управлять ботом**`)
        .setColor(config.redColor)
        .setFooter(`Автор команды - ${message.author.tag}`)
        .setTimestamp()
    channel.send({ embed }).then(m => m.delete(5000));
}

module.exports.botBusyNow = (channel, message, botVoiceChannel) => {
    embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`,`${message.guild.iconURL}`)
        .addField(`Ошибка`,`**Бот уже играет в канале ${botVoiceChannel}**`)
        .setColor(config.redColor)
        .setFooter(`Автор команды - ${message.author.tag}`)
        .setTimestamp()
    channel.send({ embed }).then(m => m.delete(5000));
}

module.exports.botNotInChannel = (channel, message) => {
    embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`,`${message.guild.iconURL}`)
        .addField(`Ошибка`,`**Бот не находится в канале**`)
        .setColor(config.redColor)
        .setFooter(`Автор команды - ${message.author.tag}`)
        .setTimestamp()
    channel.send({ embed }).then(m => m.delete(5000));
}
