const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json')
const errors = require('../utils/errors.js')
const prefix = config.prefix;

module.exports.run = async (client, message, args) => {

    let availableStations = '';

    config.availableStations.forEach((stationName) => {
        availableStations += `• ${stationName}\n`
    });

    let embed = new Discord.RichEmbed()
        .setAuthor(`Доступные станции`, `${client.user.iconURL}`)
        .setDescription(`${availableStations}`)
        .setColor(config.invisibleColor)
        .setFooter(`Список доступных станций - ${prefix}stations`)
        .setTimestamp()

    message.channel.send({
        embed
    });
}

module.exports.help = {
    name: 'stations'
}
