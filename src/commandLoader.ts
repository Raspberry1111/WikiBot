import * as fs from "fs";
import { Collection } from "discord.js";
import { Command } from "./commandTools";

const commands = new Collection<string, Command>();
fs.readdirSync("src/commands")
	.filter((file) => file.endsWith(".ts") && !file.endsWith(".template.ts"))
	.forEach(async (file) =>
		import(`./commands/${file}`).then((c: { default: Command }) => {
			let command = c.default;
			commands.set(command.name, command);
		})
	);
export default commands;
