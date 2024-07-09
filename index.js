const { Client, Events, EmbedBuilder, Message } = require("discord.js");
const mindustry = require("mindustry.js");

const moment = require('moment-timezone');

require("dotenv/config");

const config = require("./config.js");

/**
 * @type {NodeJS.Timeout}
 */
let updateInterval;

process
	.on("uncaughtExceptionMonitor", (error) => {
		console.info(error);
	})
	.on("unhandledRejection", (error) => {
		console.info(error);
	})
	.on("uncaughtException", (error) => {
		console.info(error);
	})
	.on("warning", (error) => {
		console.info(error);
	})

/**
 * @class
 * @extends {Client<true>}
 */
class MinServerMonBot extends Client {
	constructor() {
		super({ intents: 47007, shards: 0 })
	}
	async init() {
		this.once(Events.ClientReady, botReadyEvent.bind(null, this));

		this.on(Events.MessageCreate, botMessageEvent.bind(null, this));

		await this.login(process.env.TOKEN)
	}
}

/**
 * @typedef {Object} mindustryServerHost
 * @property {string} hostname
 * @property {number} port
 */

/**
 * @param {mindustryServerHost} serverHost
 * @returns {Promise<mindustryServerHost & {online: boolean} & mindustry.ServerData>}
 */
async function GetMindustryServerStats(serverHost) {
	return new Promise((resolve, reject) => {
		const server = new mindustry.Server(serverHost.hostname, serverHost.port);

		setTimeout(() => {
			server.close()

			reject({
				...serverHost,
				online: false
			})
		}, 5000)

		server.getData()
			.then(data => {
				server.close()

				resolve({ ...serverHost, ...data, online: true })
			})
			.catch((error) => {
				server.close()

				reject({
					...serverHost,
					online: false
				})
			})
	})
}

/**
 * @param {Client<true>} client
 * @param {Message<boolean>} message
 */
async function botMessageEvent(client, message) {
	if (message.channel.isDMBased()) return // Ignore DMs
	if (message.author.bot) return // Ignore bots

	if (!message.content.startsWith(client.user.toString())) return // Ignore messages not with bot ping
	if (!message.content.endsWith("setup")) return // Ignore not setup messages

	const content = [
		"Це повідомлення готове до налаштувань!",
		`**channelID:** \`${message.channel.id}\``
	]

	const setupMessage = await message.channel.send(content.join("\n"))

	content.push(`**messageID:** \`${setupMessage.id}\``)

	await setupMessage.edit(content.join("\n"))
}

/**
 * @param {Client<true>} client
 */
async function renameStatusMessage(client) {
	const guild = await client.guilds.fetch(config.Monitoring.GuildID);
	if (!guild) throw new Error("Guild not found");

	const [channel, makarasty] = await Promise.all([
		guild.channels.fetch(config.Monitoring.ChannelID),
		guild.members.fetch("509734900182548489"),
	])

	if (!channel) throw new Error("Channel not found");
	if (!channel.isTextBased()) throw new Error("Channel is not text based");

	const [message, typings] = await Promise.all([
		channel.messages.fetch(config.Monitoring.MessageID),
		channel.sendTyping()
	])

	if (!message) throw new Error("Message not found");

	const serversPromises = config.Mindustry.Servers.map(async (serverHost) => {
		try {
			const serverStats = await GetMindustryServerStats(serverHost)

			return serverStats
		} catch (error) { }
	})

	const servers = (await Promise.all(serversPromises)).map((server) => {
		return server || null
	})

	const embed = new EmbedBuilder()
		.setColor(0xFFD700)
		.setTitle("Mindustry Servers Monitoring")
		.setDescription(`**Серверів**: \`${servers.length}\`, **Гравців**: \`${servers.reduce((count, server) => server?.online ? count + server.players : count, 0)}\``)
		.setFields([
			{
				name: "\u2000",
				value: "\u2000"
			},
			...servers.map((server, index) => ({
				name: `${server ? config.Bot.OnlineEmoji : config.Bot.OfflineEmoji}\u2000${server?.name || "Невідомий сервер"}`,
				value: [
					`\`${config.Mindustry.Servers[index].hostname}:${config.Mindustry.Servers[index].port}\` **-** **Гравців**: \`${server?.players || "0"}\`/\`${server?.playerLimit || "0"}\``,
					`**Карта**: \`${server?.map || "Невідома карта"}\` **/** \`${server?.gamemode || "Невідомий режим"}\` (\`${server?.wave || 0}\`)`
				].join("\n")
			}))
		])
		.setFooter({
			text: [
				`Оновлення кожну хвилину. В останнє: ${moment().tz(config.Bot.Timezone).locale(config.Bot.TimeLocale).format(config.Bot.TimeFormat)}`,
				makarasty && `Made by: ${makarasty.user.tag}`
			].join("\n"),
			iconURL: makarasty.user.displayAvatarURL() || undefined
		})

	await message.edit({ embeds: [embed], components: [], content: "" });
	console.log("Повідомлення успішно змінено!");
}

/**
 * @param {Client<true>} client
 */
async function botReadyEvent(client) {
	updateInterval && clearInterval(updateInterval);
	console.info(`Discord bot ready as user: ${client.user.tag}`);

	await renameStatusMessage(client);

	updateInterval = setInterval(async () => {
		await renameStatusMessage(client);
	}, 70 * 1000);
}

new MinServerMonBot().init();