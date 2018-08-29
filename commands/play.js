const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("../config.json");
const errors = require('../utils/errors.js')
const prefix = config.prefix;

const soundsessionURL = 'http://soundsession.center:8000/';

module.exports.run = async (client, message, args) => {

    let messageArray = message.content.split(/\s+/g);

    let clientVoiceconnection = client.voiceConnections.get(message.guild.id);

    let userVoiceChannel = message.member.voiceChannel;
    let requestedStation;

    if (!requestedStation) {
        let randomNum = Math.floor(Math.random() * (config.availableStations.length));

        requestedStation = config.availableStations[randomNum];
    } else {
        requestedStation = args[0].toLowerCase();
    }

    if (!config.availableStations.includes(requestedStation)) return errors.stationNotFound(message.channel, message);
    if (!userVoiceChannel) return errors.userNotInChannel(message.channel, message);
    if (clientVoiceconnection && userVoiceChannel.id != clientVoiceconnection.channel.id && clientVoiceconnection.channel.members.size > 1) return errors.botBusyNow(message.channel, message, botVoiceChannel);

    let currentStream = soundsessionURL + requestedStation;

    let guildIcon = '';

    message.member.voiceChannel.join().then(connection => {
        const dispatcher = connection.playStream(currentStream);

        if (message.guild.iconURL == null) {
            guildIcon = 'https://cdn.discordapp.com/attachments/484360305837735949/484360414277402624/freeios7.com_apple_wallpaper_rainbow-blurs_iphone5.jpg'
        } else {
            guildIcon = message.guild.iconURL;
        }

        let embed = new Discord.RichEmbed()
            .setAuthor(`${message.guild.name}`, `${guildIcon}`)
            .addField(`Сейчас играет станция`, `${requestedStation}`, true)
            .addField(`Использовал(а) команду`, `${message.author}`, true)
            .setColor(config.moonlightColor)
            .setFooter(`${prefix}play [Название радиостанции] - Запустить бота/Переключить станцию`)
            .setTimestamp()

        message.channel.send({
            embed
        });

        console.log(message.guild.iconURL);

    }).catch(function(err) {
        if (err) console.log(err);
    });

}

module.exports.help = {
    name: 'play'
}
