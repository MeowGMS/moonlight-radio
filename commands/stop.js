const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json')
const errors = require('../utils/errors.js')
const prefix = config.prefix;

module.exports.run = async (client, message, args) => {

    message.delete(200).catch(console.error);
    
    if (!message.member.roles.has(config.djRoleID) && !message.member.hasPermission('ADMINISTRATOR')) return errors.userHasNoPerms(message.channel, message);

    let connection = client.voiceConnections.get(message.guild.id);
    let botVoiceChannel = message.guild.members.get(client.user.id).voiceChannel;

    if (!botVoiceChannel) return errors.botNotInChannel(message.channel, message);

    if (message.member.voiceChannel.id != botVoiceChannel.id && botVoiceChannel.members.size > 1) return errors.userNotInChannel(message.channel, message);

    if (!connection) {
        botVoiceChannel.leave();
    } else {
        connection.disconnect()
        if (botVoiceChannel) {
            botVoiceChannel.leave();
        }

    }

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
