import { Message } from "discord.js";

export interface Command {
	name: string;
	description: string;
	execute(message: Message, args: Array<String> | null): void;
	args?: boolean;
	usage?: string;
	guildOnly?: boolean;
	cooldown?: number;
	aliases?: Array<string>;
}
