import { Command } from "../commandTools";
import { Collection, MessageEmbed } from "discord.js";

const command: Command = {
	name: "help",
	description: "List all of my commands or info about a specific command.",
	aliases: ["commands"],
	usage: "[command name]",
	cooldown: 5,
	async execute(message, args) {
		const c = await import("../commandLoader");
		const commands = c.default;
		let prefix = process.env.PREFIX;

		if (!args || !args.length) {
			const embed = new MessageEmbed()
				.setTitle("Commands")
				.setColor("#aaaaaa")
				.setFooter(
					`Use ${prefix}help [command name] to get more info on a command!`
				);
			commands.forEach((cmd) => {
				embed.addField(cmd.name, `\`${prefix}${cmd.name}\``, true);
			});
			const dm = false;
			if (dm) {
				return message.author
					.send(embed)
					.then(() => {
						if (message.channel.type === "dm") return;
						message.reply(
							"I've sent you a DM with all my commands!"
						);
					})
					.catch((error) => {
						console.error(
							`Could not send help DM to ${message.author.tag}.\n`,
							error
						);
						message.reply(
							"It seems like I can't DM you! Do you have DMs disabled?"
						);
					});
			} else {
				return message.channel.send(embed);
			}
		}

		const name = args[0].toLowerCase();
		const command =
			commands.get(name) ||
			commands.find((c) => {
				if (c.aliases && c.aliases.includes(name)) {
					return true;
				} else {
					return false;
				}
			});

		if (!command) {
			return message.reply("That's not a valid command!");
		}
		const embed = new MessageEmbed()
			.setTitle(command.name)
			.addField("**Description:**", command.description)
			.addField("**Cooldown:**", `${command.cooldown || 3} second(s)`)
			.setColor("#aaaaaa");

		if (command.aliases)
			embed.addField("**Aliases:**", command.aliases?.join(", "));
		if (command.usage)
			embed.addField(
				"**Usage:**",
				`${prefix}${command.name} ${command.usage}`
			);

		message.channel.send(embed);
	},
};

export default command;
