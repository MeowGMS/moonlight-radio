const Discord = require("discord.js");
const config = require("../config.json");
const prefix = "v.";


module.exports.run = async (client, message, args, dbMessage) => {

    const messageArray = message.content.split(/\s+/g);
    const otherArgs = messageArray.slice(1);
    const command = messageArray[0].slice(prefix.length).toLowerCase();

    if (!message.member.roles.has(config.voteRoleID) && !message.member.hasPermission('ADMINISTRATOR')) return message.channel.send(`**❌ У Вас нет прав использовать данную команду**`).then(m => m.delete(5000));

    message.delete(300);

    let userForPunish = message.mentions.users.first();
    let punishTime = parseInt(messageArray[2], 10);
    let reasonArgCount = prefix.length + command.length + messageArray[1].length + messageArray[2].length + 3;
    let punishReason = message.content.slice(reasonArgCount);

    if (!userForPunish) return message.channel.send(`**❌ Юзер не найден**`).then(m => m.delete(5000));
    if (!punishTime) return message.channel.send(`**❗ Укажите время мута**`).then(m => m.delete(5000));
    if (!messageArray[3]) return message.channel.send(`**❗ Укажите причину мута**`).then(m => m.delete(5000));

    dbMessage.findOne({
        punishableID:
    }).then(voiting => {
        if (voiting) {
            return message.channel.send(`**❌ Голосование по поводу мута данного юзера уже запущено**`)
        } else {

            let embed = new Discord.RichEmbed()
                .setAuthor(`${message.author.tag}`, `${message.author.avatarURL}`)
                .addField(`Кого наказывают?`, `**Юзер:** ${userForPunish}\n**ID:** \`${userForPunish.id}\`\n**Тег:** \`${userForPunish.tag}\``, true)
                .addField(`Время мута`, `${punishTime} минут`, true)
                .addField(`Причина`, `\`\`\`fix\n${punishReason}\`\`\``)
                .setFooter(`${message.guild.name}`)
                .setThumbnail(`${userForPunish.avatarURL}`)
                .setTimestamp()

            client.guilds.get('468327359687426049').channels.get(config.votesChannelID).send(`\`\`\` \`\`\``, {
                embed
            }).then(m => {
                m.react(`✅`);
                m.react(`❌`)
                client.channels.get(config.votesChannelID).fetchMessage(m.id).catch(console.error);

                new dbMessage({
                    id: m.id,
                    in_favor: 1,
                    against: 0,
                    time: punishTime * 60 * 1000,
                    authorID: message.author.id,
                    punishableID: userForPunish.id
                }).save().then(() => {
                    console.log(`db doc created`);
                });    
            });
            
        }
    })

}

module.exports.help = {
    name: "votemute"
}
