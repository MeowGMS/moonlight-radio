const Discord = require("discord.js");
//const config = require("../config.json");
const prefix = 'v.';
const command = 'event';

module.exports.run = async (client, message, args) => {

    const messageArray = message.content.split(/\s+/g);
    const otherArgs = messageArray.slice(1);
    //const reactEmoji = client.emojis.get(`456206670624718858`)

    //if (!message.member.permissions.has("ADMINISTRATOR") && !message.member.roles.has(config.universeRoleID) && !message.member.roles.has(config.starsRoleID) && !message.member.roles.has(config.superNovaRoleID)) return message.channel.send(`**У Вас недостаточно прав для использования данной команды**`).then(m => m.delete(5000));

    let sliceNum = prefix.length + command.length + 1;

    let event_text = message.content.slice(sliceNum);

    //message.channel.send(event_text);

    let eventAttachment = (message.attachments).array();

    let attachmentCounter = 0;

    eventAttachment.forEach(function(attachment) {
        attachmentCounter++;
    });

    console.log(`Кол-во аттачментов1234: ${attachmentCounter}`);

    if (attachmentCounter == 0) {

        let embed = new Discord.RichEmbed()
            //.addField(`Ведущий`, `${message.author}`)
            .setDescription(event_text)
            .setColor(message.member.highestRole.color)
            .setFooter(`${message.guild.name} | ✅мероприятия`)
            .setTimestamp()

        //message.guild.roles.get(config.eventPlayerRoleID).setMentionable(true).then(() => {
            message.channel.send({
                embed
            }).then(function(message) {
                //message.react(reactEmoji).catch();
                setTimeout(function() {
                    //message.guild.roles.get(config.eventPlayerRoleID).setMentionable(false);
                }, 2000);
            }).catch(console.error);
        //});
    } else {
        eventAttachment.forEach(function(attachment) {
            let embed = new Discord.RichEmbed()
                //.addField(`Ведущий`, `${message.author}`)
                .setDescription(event_text)
                .setColor(message.member.highestRole.color)
            //.setImage(attachment.url)
            //.setTimestamp()

            //message.guild.roles.get(config.eventPlayerRoleID).setMentionable(true).then(() => {
                message.channel.send({
                    embed
                }).then(function(message) {
                    //message.react(reactEmoji).catch();
                    setTimeout(function() {
                        //message.guild.roles.get(config.eventPlayerRoleID).setMentionable(false);
                    }, 2000);
                }).catch(console.error);
            //});

            embed = new Discord.RichEmbed()
                .setColor(message.member.highestRole.color)
                .setFooter(`${message.guild.name} | ✅мероприятия`)
                .setImage(attachment.url)
                .setTimestamp()

            message.channel.send({
                embed
            })
        });

    }



}

module.exports.help = {
    name: "event"
}
