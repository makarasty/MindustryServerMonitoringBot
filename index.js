require("dotenv/config");

const {
	Client,
	Events,
	EmbedBuilder,
	Message,
	Partials,
	GatewayIntentBits,
} = require("discord.js");

const mindustry = require("mindustry.js");

const moment = require("moment-timezone");

const config = require("./config.js");

process
	.on("uncaughtExceptionMonitor", (error) => console.info(error))
	.on("unhandledRejection", (error) => console.info(error))
	.on("uncaughtException", (error) => console.info(error))
	.on("warning", (error) => console.info(error));

const partials = [
	Partials.Channel,
	Partials.GuildMember,
	Partials.Message,
	Partials.User,
];

const intents = [
	GatewayIntentBits.GuildEmojisAndStickers,
	GatewayIntentBits.GuildMessageReactions,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.GuildIntegrations,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildModeration,
	GatewayIntentBits.Guilds,
];

/**
 * @param {string} message
 * @returns {string}
 */
function removeColorCodes(message) {
	return message.replace(/\[[^\]]+\]/g, "");
}

/**
 * @class
 * @extends {Client<true>}
 */
class MinServerMonBot extends Client {
	constructor() {
		super({
			shards: 0,
			shardCount: 1,
			partials,
			intents,
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
 *  Returns a promise that resolves to an object containing the server host,
 *  server data, and online status if successful, or null if the server is offline or an error occurs.
 */
async function GetMindustryServerStats(serverHost) {
	const TIMEOUT_DURATION = 5000;

	const server = new mindustry.Server(serverHost.hostname, serverHost.port);

	try {
		const fetchDataPromise = server.getData();

		const timeoutPromise = new Promise((resolve) => {
			setTimeout(() => {
				resolve(null);
			}, TIMEOUT_DURATION);
		});

		const data = await Promise.race([fetchDataPromise, timeoutPromise]);

		if (data) {
			return { ...serverHost, ...data, online: true };
		} else {
			return null;
		}
	} catch (error) {
		if (error instanceof Error) {
			console.error(
				`Error fetching data from server ${serverHost.hostname}:${serverHost.port} - ${error.message}`,
			);
		}
		return null;
	} finally {
		server.close();
	}
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
	const guildId = config.Monitoring.GuildID;
	const guild = await client.guilds.fetch(guildId);

	if (!guild) {
		throw new Error(`Guild with ID ${guildId} not found.`);
	}

	const channelId = config.Monitoring.ChannelID;
	const ownerId = config.Bot.OwnerId;

	const [channel, owner] = await Promise.all([
		guild.channels.fetch(channelId),
		guild.members.fetch(ownerId),
	]);

	if (!channel) {
		throw new Error(
			`Channel with ID ${channelId} not found in guild ${guild.name}.`,
		);
	}

	if (!channel.isTextBased()) {
		throw new Error(`Channel ${channel.name} is not a text-based channel.`);
	}

	if (!owner) {
		throw new Error(
			`Member with ID ${ownerId} not found in guild ${guild.name}.`,
		);
	}

	const messageId = config.Monitoring.MessageID;

	const [message, typing] = await Promise.all([
		channel.messages.fetch(messageId),
		channel.sendTyping(),
	]);

	if (!message) {
		throw new Error(
			`Message with ID ${messageId} not found in channel ${channel.name}.`,
		);
	}

	const serversData = await Promise.all(
		config.Mindustry.Servers.map(async (serverHost) =>
			GetMindustryServerStats(serverHost).catch(() => null),
		),
	);

	const totalServers = serversData.length;

	const totalPlayers = serversData.reduce((count, server) => {
		if (server?.online) {
			return count + server.players;
		}

		return count;
	}, 0);

	const footerText = [
		`Оновлення кожну хвилину. В останнє: ${moment()
			.tz(config.Bot.Timezone)
			.locale(config.Bot.TimeLocale)
			.format(config.Bot.TimeFormat)}`,
		owner ? `Made by: ${owner.user.tag}` : null,
	]
		.filter(Boolean)
		.join("\n");

	const footerIconURL = owner?.user.displayAvatarURL() || undefined;

	const embed = new EmbedBuilder()
		.setColor(0xffd700)
		.setTitle("Mindustry Servers Monitoring")
		.setDescription(
			`**Серверів**: \`${totalServers}\`, **Гравців**: \`${totalPlayers}\``,
		)
		.addFields(
			serversData.map((server, index) => {
				const isOnline = Boolean(server?.online);

				const thatServerConfig = config.Mindustry.Servers[index];

				const statusEmoji = isOnline
					? config.Bot.OnlineEmoji
					: config.Bot.OfflineEmoji;

				const serverName = server?.name
					? removeColorCodes(server?.name)
					: thatServerConfig?.name || "Невідомий сервер";

				const { hostname, port } = thatServerConfig || {
					hostname: "Unknown hostname",
					port: "Unknown port",
				};

				const currentPlayers = server?.players || "0";
				const playerLimit = server?.playerLimit || "0";

				const map = server?.map || "Невідома карта";
				const gamemode = server?.gamemode || "Невідомий режим";

				const fieldName = `${statusEmoji}\u2000${serverName}`;

				const fieldValue = [
					`\`${hostname}:${port}\` **-** **Гравців**: \`${currentPlayers}\`/\`${playerLimit}\``,
					`**Карта**: \`${map}\` **/** \`${gamemode}\``,
				].join("\n");

				return {
					name: fieldName,
					value: fieldValue,
				};
			}),
		)
		.setFooter({
			text: footerText,
			iconURL: footerIconURL,
		});

	await message.edit({
		embeds: [embed],
		components: undefined,
		content: null,
	});

	console.log("Message successfully changed!");
}

/**
 * @param {Client<true>} client
 */
async function botSetStatus(client) {
	return client.user.setActivity(
		config.Bot.Status.text,
		config.Bot.Status.options,
	);
}

/**
 * @param {Client<true>} client
 */
async function botReadyEvent(client) {
	console.info(`Discord bot ready as user: ${client.user.tag}`);

	await botSetStatus(client);

	setInterval(async () => {
		await botSetStatus(client);
	}, 30 * 60 * 1000);

	await renameStatusMessage(client);

	setInterval(async () => {
		await renameStatusMessage(client);
	}, 65 * 1000);
}

new MinServerMonBot().init();
