import { Collection } from "discord.js";
import { Command } from "./commandTools";

export const cooldowns = new Collection<string, Collection<string, number>>();

export function commandOnCooldown(
	command: Command,
	id: string
): number | undefined {
	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Collection<string, number>());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	if (!timestamps) return;
	const cooldownAmount = (command.cooldown || 3) * 1000;
	let c = timestamps.get(id);
	if (c) {
		const expirationTime = c + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return timeLeft;
		}
	}
	timestamps.set(id, now);
	setTimeout(() => timestamps.delete(id), cooldownAmount);
}
