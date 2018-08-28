const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');

client.on(`ready`, () => {
	console.log(`ready`);
});

client.on('message', message => {
	
	if (message.content.startsWith('>play')) {
		const streamOptions = { seek: 0, volume: 1 };
		message.member.voiceChannel.join().then(connection => {
			const dispatcher = connection.playStream('http://soundsession.center:8000/best');
		}).catch(console.error);
	}
});

client.login(process.env.token);
