const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json')
const errors = require('../utils/errors.js')
const prefix = config.prefix;

module.exports.run = async (client, message, args) => {

    message.delete(200).catch(console.error);

    let availableStations = '';

    config.availableStations.forEach((stationName) => {
        availableStations += `• **${stationName}**\n`
    });

    let embed = new Discord.RichEmbed()
        .setAuthor(`Доступные станции`, `${client.user.avatarURL}`)
        .setDescription(`${availableStations}`)
        .setColor(config.invisibleColor)
        .setFooter(`${prefix}stations - Список доступных станций`)
        .setTimestamp()

    message.channel.send({
        embed
    });
}

module.exports.help = {
    name: 'stations'
}
