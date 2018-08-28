const Discord = require('discord.js');
const client = new Discord.Client();
const bot = new Discord.Client();


const bestStream = 'http://soundsession.center:8000/best';
const indieStream = 'http://soundsession.center:8000/indie';
const liteStream = 'http://soundsession.center:8000/lite';
const darkStream = 'http://soundsession.center:8000/dark';
const hardStream = 'http://soundsession.center:8000/hard';
const drumStream = 'http://soundsession.center:8000/drum';
const deepStream = 'http://soundsession.center:8000/deep';
const beatStream = 'http://soundsession.center:8000/beat';

client.on(`ready`, () => {
	console.log(`Bot ready`);
});

client.on('message', message => {
	
	const messageArray = message.content.split(/\s+/g);
    const otherArgs = messageArray.slice(1);
    const command = messageArray[0].slice(prefix.length).toLowerCase();
	
	let currentStream;
	let radioType = otherArgs[0];
	
	if (message.content.startsWith('>play')) {
		
		message.delete(100).catch(console.error);
		
		switch(radioType) {
			case 'best':  
				currentStream = bestStream;
			break;

			case 'indie':  
				currentStream = indieStream;
			break;
			
			case 'lite':
				currentStream = liteStream;
			break;
			
			case 'dark':
				currentStream = darkStream;
			break;
			
			case 'hard':
				currentStream = hardStream;
			break;
			
			case 'drum':
				currentStream = drumStream;
			break;
			
			case 'deep':
				currentStream = deepStream;
			break;
			
			case 'beat':
				currentStream = beatStream;
			break;
	
			default:
				return message.channel.send(`**Радиостанция не найдена**`);
			break;
		}
		
		message.channel.send(`**Играю радиостанцию \`${currentStream}\`**`)
		
		message.member.voiceChannel.join()
			.then(connection => {
				const dispatcher = connection.playStream(currentStream);
			}).catch(console.error);
	}
	
	if (message.content.startsWith('>stop')) {
		let connection = client.voiceConnections.get(message.guild.id);
		
		connection.disconnect().then(() => {
			message.channel.send(`**Бот успешно отключился от канала**`)
		}).catch(console.error);
	}
});


client.login(process.env.token);
