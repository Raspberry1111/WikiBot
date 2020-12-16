import { Command } from "../commandTools";
import f from "node-fetch";
import { MessageEmbed } from "discord.js";
import { URLSearchParams } from "url";


const fetch = (url: string) =>
	f(url, {
		headers: {
			"User-Agent": "WikiBot/1.0 (wikibot@gmail.org) node-fetch",
		},
	});

const command: Command = {
	name: "wiki",
	description: "Pulls the first paragraph of a wikipedia article.",
	usage: "[summary|search] [pageid|search term]",
	args: true,
	execute(message, args) {
		if (!args) return;
		const type = args[0];

		if (type === "summary") {
			const pageId = args[1];
			const pageUrl = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&pageids=${pageId}`;
			fetch(pageUrl)
				.then((res) => res.json())
				.then((data) => {
					try {
						// Get an articles first paragraph
						const page =
							data.query.pages[Object.keys(data.query.pages)[0]];

						let extract: string = page.extract;
						if (extract.length > 364) {
							extract = extract.substring(0, 364) + " ...";
						}
						// Recieve Article's image
						const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=pageimages&format=json&pithumbsize=2048`;
						fetch(imageUrl)
							.then((t) => t.json())
							.then((imageData) => {
								
								const embed = new MessageEmbed()
									.setTitle(page.title)
									.setAuthor("Wikipedia")
									.setColor("#AAAAAA")
									.setURL(
										`https://en.wikipedia.org/?curid=${pageId}`
									)
									.addField("Summary", extract)
									.setImage(
										imageData.query.pages[
											Object.keys(
												imageData.query.pages
											)[0]
										].thumbnail.source
									);

								message.channel.send(embed);
							});
					} catch {
						message.reply("Invalid Page ID!");
						return;
					}
				});
		}

		if (type === "search") {
			const searchTerm = args.slice(1).join(" ");
			const searchUrl = `https://en.wikipedia.org/w/api.php?origin=*&limit=9&format=json&action=opensearch&search=${searchTerm}`;

			fetch(searchUrl)
				.then((res) => res.json())
				.then(async (results: Array<Array<string>>) => {
					let embed = new MessageEmbed()
						.setAuthor("Wikipedia")
						.setColor("#AAAAAA")
						.setURL("https://www.wikipedia.org");
					// Will store the result after they are parsed
					let resultsData: Array<{
						name: string;
						value: string;
						inline?: boolean;
					}> = [];
					// Loop through every result
					// And Parse the image, title, and url

					for (let i = 0; i < results[1].length; i++) {
						const title = results[1][i];
						const url = results[3][i];
						await fetch(
							`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info&titles=${url.replace(
								"https://en.wikipedia.org/wiki/",
								""
							)}`
						)
							.then((res) => res.json())
							.then((pageIdData) => {
								const pageId = Object.keys(
									pageIdData.query.pages
								)[0];
								resultsData.push({
									name: title,
									value: `${process.env.PREFIX}wiki summary [${pageId}](${url})`,
									inline: true,
								});
								
							})
							.catch((e) => console.error(e));
					}
					message.channel.send(
						embed.addFields(resultsData)
					);
				});
		}
	},
};

export default command;
