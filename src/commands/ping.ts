import { Command } from "../commandTools"

const command: Command = {
	name: "ping",
	description: "Ping!",
	execute(message, args) {
		message.channel.send("Pong.");
	},
};

export default command