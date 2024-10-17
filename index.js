const {
	Client,
	Events,
	EmbedBuilder,
	Message,
	ActivityType,
} = require("discord.js");
const mindustry = require("mindustry.js");

const moment = require("moment-timezone");

require("dotenv/config");

const config = require("./config.js");

/**
 * @type {NodeJS.Timeout}
 */
let testUpdateInterval;

/**
 * @type {NodeJS.Timeout}
 */
let statusUpdateInterval;

process
	.on("uncaughtExceptionMonitor", (error) => console.info(error))
	.on("unhandledRejection", (error) => console.info(error))
	.on("uncaughtException", (error) => console.info(error))
	.on("warning", (error) => console.info(error));

/**
 * @class
 * @extends {Client<true>}
 */
class MinServerMonBot extends Client {
	constructor() {
		super({
			intents: 47007,
			shards: 0,
		});
	}
	async init() {
		this.once(Events.ClientReady, botReadyEvent.bind(null, this));
		this.on(Events.MessageCreate, botMessageEvent.bind(null, this));

		await this.login(process.env.TOKEN);
	}
}

/**
 * @typedef {Object} mindustryServerHost
 * @property {string} hostname
 * @property {number} port
 */

/**
 * @param {mindustryServerHost} serverHost
 * @returns {Promise<(mindustryServerHost & {online: boolean} & mindustry.ServerData)?>}
 */
async function GetMindustryServerStats(serverHost) {
	return new Promise(async (resolve, reject) => {
		const justDie = setTimeout(() => {
			server.close();
			resolve(null);
		}, 5000);

		const server = new mindustry.Server(serverHost.hostname, serverHost.port);

		try {
			const data = await server.getData();
			resolve({ ...serverHost, ...data, online: true });
		} catch {
			resolve(null);
		} finally {
			clearTimeout(justDie);
			server.close();
		}
	});
}

/**
 * @param {Client<true>} client
 * @param {Message<boolean>} message
 */
async function botMessageEvent(client, message) {
	if (message.channel.isDMBased()) return;
	if (message.author.bot) return;

	if (!message.content.startsWith(client.user.toString())) return;
	if (!message.content.endsWith("setup")) return;

	const content = [
		"Це повідомлення готове до налаштувань!",
		`**channelID:** \`${message.channel.id}\``,
	];

	const setupMessage = await message.channel.send(content.join("\n"));

	content.push(`**messageID:** \`${setupMessage.id}\``);

	await setupMessage.edit(content.join("\n"));
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
	]);

	if (!channel) throw new Error("Channel not found");
	if (!channel.isTextBased()) throw new Error("Channel is not text based");

	const [message, typing] = await Promise.all([
		channel.messages.fetch(config.Monitoring.MessageID),
		channel.sendTyping(),
	]);

	if (!message) throw new Error("Message not found");

	const serversData = await Promise.all(
		config.Mindustry.Servers.map(async (serverHost) =>
			GetMindustryServerStats(serverHost).catch(() => null),
		),
	);

	const embed = new EmbedBuilder()
		.setColor(0xffd700)
		.setTitle("Mindustry Servers Monitoring")
		.setDescription(
			`**Серверів**: \`${
				serversData.length
			}\`, **Гравців**: \`${serversData.reduce(
				(count, server) => (server?.online ? count + server.players : count),
				0,
			)}\``,
		)
		.setFields(
			serversData.map((server, index) => ({
				name: `${
					server ? config.Bot.OnlineEmoji : config.Bot.OfflineEmoji
				}\u2000${server?.name || "Невідомий сервер"}`,
				value: [
					`\`${config.Mindustry.Servers[index].hostname}:${
						config.Mindustry.Servers[index].port
					}\` **-** **Гравців**: \`${server?.players || "0"}\`/\`${
						server?.playerLimit || "0"
					}\``,
					`**Карта**: \`${server?.map || "Невідома карта"}\` **/** \`${
						server?.gamemode || "Невідомий режим"
					}\` (\`${server?.wave || 0}\`)`,
				].join("\n"),
			})),
		)
		.setFooter({
			text: [
				`Оновлення кожну хвилину. В останнє: ${moment()
					.tz(config.Bot.Timezone)
					.locale(config.Bot.TimeLocale)
					.format(config.Bot.TimeFormat)}`,
				makarasty && `Made by: ${makarasty.user.tag}`,
			].join("\n"),
			iconURL: makarasty?.user.displayAvatarURL() || undefined,
		});

	await message.edit({
		embeds: [embed],
		components: [],
		content: "",
	});

	console.log("Повідомлення успішно змінено!");
}

/**
 * @param {Client<true>} client
 */
async function botSetStatus(client) {
	return client.user.setActivity("Слідкую за серверами mindustry", {
		type: ActivityType.Watching,
		url: "https://www.twitch.tv/makarasty",
	});
}

/**
 * @param {Client<true>} client
 */
async function botReadyEvent(client) {
	testUpdateInterval && clearInterval(testUpdateInterval);
	statusUpdateInterval && clearInterval(statusUpdateInterval);

	console.info(`Discord bot ready as user: ${client.user.tag}`);

	await botSetStatus(client);

	statusUpdateInterval = setInterval(async () => {
		await botSetStatus(client);
	}, 30 * 60 * 1000);

	await renameStatusMessage(client);

	testUpdateInterval = setInterval(async () => {
		await renameStatusMessage(client);
	}, 65 * 1000);
}

new MinServerMonBot().init();
