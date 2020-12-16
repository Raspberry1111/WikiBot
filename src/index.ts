if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

import { Client, Collection } from "discord.js";
import { Command } from "./commandTools";
import Commands from "./commandLoader";
import { cooldowns, commandOnCooldown } from "./cooldownManager";

// Extends Client to allow custom properties
class WikiBot extends Client {
	commands = Commands;
	cooldowns = cooldowns;
}

const client = new WikiBot();
const prefix = process.env.PREFIX || "!";

client.once("ready", () => {
	console.log("WikiBot Online!");
});

client.on("message", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift()?.toLowerCase();

	// If that command exists, run it
	if (!commandName) return;
	const command =
		client.commands.get(commandName) ||
		client.commands.find((cmd) => {
			if (cmd.aliases && cmd.aliases.includes(commandName)) {
				return true;
			} else {
				return false;
			}
		});

	if (!command) return;

	if (command.guildOnly && message.channel.type === "dm") {
		return message.reply("I can't execute that command inside DMs!");
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send(reply);
	}
	let timeLeft = commandOnCooldown(command, message.author.id);
	if (timeLeft) {
		message.reply(
			`Please wait ${timeLeft.toFixed(
				1
			)} more second(s) before reusing the \`${command.name}\` command.`
		);
		return;
	}
	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply("There was an error trying to execute that command!");
	}
});

client.login(process.env.TOKEN);
