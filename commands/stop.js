const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json')
const errors = require('../utils/errors.js')
const prefix = config.prefix;

module.exports.run = async (client, message, args) => {

    let connection = client.voiceConnections.get(message.guild.id);

    if (!connection && !client.voiceConnections.get(message.guild.id).channel) return errors.botNotInChannel(message.channel, message);

    connection.disconnect()

    if (message.guild.iconURL == null) {
        guildIcon = 'https://cdn.discordapp.com/attachments/484360305837735949/484360414277402624/freeios7.com_apple_wallpaper_rainbow-blurs_iphone5.jpg'
    } else {
        guildIcon = message.guild.iconURL;
    }

    let embed = new Discord.RichEmbed()
        .setAuthor(`Бот отключён`, `${guildIcon}`)
        .addField(`Использовал(а) команду`, `${message.author}`, true)
        .setColor(config.moonlightColor)
        .setFooter(`${prefix}stop - Отключение бота`)
        .setTimestamp()

    message.channel.send({
        embed
    });
}

module.exports.help = {
    name: 'stop'
}
