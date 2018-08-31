const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../config.json')
const errors = require('../utils/errors.js')
const prefix = config.prefix;

module.exports.run = async (client, message, args) => {

    message.delete(200).catch(console.error);
    
    if (message.channel.id != '401098551972593665') return;

    let embed = new Discord.RichEmbed()
        .setAuthor(`Список команд`, `${client.user.avatarURL}`)
        .setDescription(`\`<..>\` - Обязательные параметры
\`[..]\` - Необязательные параметры

\`${prefix}play [Название радиостанции]\` - **Запуск бота/Переключение станции**
\`${prefix}stations\` - **Список доступных радиостанций**
\`${prefix}stop\` - **Отключение бота**
`)
        .setColor(config.invisibleColor)
        .setFooter(`${prefix}help - Узнать команды бота`)
        .setTimestamp()

    message.channel.send({
        embed
    });
}

module.exports.help = {
    name: 'help'
}
