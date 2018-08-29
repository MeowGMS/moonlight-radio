const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("../config.json");
const errors = require('../utils/errors.js')
const prefix = config.prefix;

const soundsessionURL = 'http://soundsession.center:8000/';

module.exports.run = async (client, message, args) => {

    let messageArray = message.content.split(/\s+/g);

    let clientVoiceChannel = client.voiceConnections.get(message.guild.id).channel;
    let userVoiceChannel = message.member.voiceChannel;

    let requestedStation = args[0].toLowerCase();

    if (!requestedStation) {
        let randomNum = Math.floor(Math.random() * (config.availableStations.length));

        requestedStation = config.availableStations[randomNum];
    }

    if (!config.availableStations.includes(requestedStation)) return errors.stationNotFound(message.channel, message);
    if (!userVoiceChannel) return errors.userNotInChannel(message.channel, message);
    if (clientVoiceChannel && userVoiceChannel.id != clientVoiceChannel.id && clientVoiceChannel.members.size > 1) return errors.botBusyNow(message.channel, message, botVoiceChannel);

    let currentStream = soundsessionURL + requestedStation;

    message.member.voiceChannel.join().then(connection => {
        const dispatcher = connection.playStream(currentStream);

        let embed = new Discord.RichEmbed()
            .setAuthor(`${message.guild.name}`, `${message.guild.iconURL}`)
            .addField(`Сейчас играет`, `${requestedStation}`, true)
            .addField(`Использовал(а) команду`, `${message.author}`, true)
            .setColor(config.moonlightColor)
            .setFooter(`Запустить бота/Переключить станцию - ${prefix}play [Название радиостанции]`)
            .setTimestamp()

        message.channel.send({
            embed
        });

    }).catch(function(err) {
        if (err) console.log(err);
    });

}

module.exports.help = {
    name: 'play'
}
