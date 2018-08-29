const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json')
const errors = require('../utils/errors.js')
const prefix = config.prefix;

module.exports.run = async (client, message, args) => {

    let connection = client.voiceConnections.get(message.guild.id);

    if (!connection) return errors.botNotInChannel(message.channel, message);

    connection.disconnect()

    let embed = new Discord.RichEmbed()
        .setAuthor(`Бот отключён`, `${message.guild.iconURL}`)
        .addField(`Использовал(а) команду`, `${message.author}`, true)
        .setColor(config.moonlightColor)
        .setFooter(`Отключить бота - ${prefix}stop`)
        .setTimestamp()

    message.channel.send({
        embed
    });
}

module.exports.help = {
    name: 'stop'
}
