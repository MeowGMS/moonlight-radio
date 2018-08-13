const Discord = require("discord.js");
const config = require("../config.json");
const prefix = "v.";


module.exports.run = async (client, message, args, dbMessage) => {

    if (!message.member.roles.has(config.voteRoleID)) return message.channel.send(`**У Вас нет прав использовать данную команду**`);
}

module.exports.help = {
    name: "votemute"
}
