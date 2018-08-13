const Discord = require("discord.js");
const config = require("../config.json");
const prefix = "v.";


module.exports.run = async (client, message, args, dbMessage) => {

    const messageArray = message.content.split(/\s+/g);
    const otherArgs = messageArray.slice(1);
    const command = messageArray[0].slice(prefix.length).toLowerCase();

    if (!message.member.roles.has(config.voteRoleID)) return message.channel.send(`**❌ У Вас нет прав использовать данную команду**`).then(m => m.delete(5000));

    let userForPunish = message.mentions.users.first();
    let punishTime = parseInt(messageArray[2], 10);
    let reasonArgCount = prefix.length + command.length + messageArray[1].lenght + messageArray[2].lenght + 3;
    let punishReason = message.content.slice(reasonArgCount);

    if (!userForPunish) return message.channel.send(`**❌ Юзер не найден**`);

    let embed = new Discord.RichEmbed()
        .setAuthor(`${message.author.id}`, `${message.author.iconURL}`)
        .addField(`Кого наказывают?`, `**Юзер:** ${userForPunish}\n**ID:** \`${userForPunish.id}\`\n**Тег:** ${userForPunish.tag}`)
        .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``)
        .setFooter(`${message.guild.name}`)
        //.setThumbnail(`${userForPunish.avatarURL}`)
        .setTimestamp()

    client.guilds.get('468327359687426049').channels.get(config.votesChannelID).send(`\`\`\` \`\`\``, {
        embed
    }).then(m => {
        m.react(`✅`);
        m.react(`❌`)
        client.channels.get(config.votesChannelID).fetchMessage(m.id).catch(console.error);
    });

    

}

module.exports.help = {
    name: "votemute"
}
