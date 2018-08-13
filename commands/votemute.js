const Discord = require("discord.js");
const config = require("../config.json");
const prefix = "v.";


module.exports.run = async (client, message, args, dbMessage) => {

    if (!message.member.roles.has(config.voteRoleID))
}

module.exports.help = {
    name: "servers"
}
