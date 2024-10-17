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
 * @param {string} template
 * @param {Record<string, string>} replacements
 * @returns {string}
 */
function replacePlaceholders(template, replacements) {
	let output = template;
	for (const key in replacements) {
		const placeholder = `{${key}}`;
		const value = replacements[key];
		output = output.split(placeholder).join(value);
	}
	return output;
}

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
 * @returns {Promise<(mindustryServerHost & { online: boolean } & mindustry.ServerData) | null>}
 *          Returns a promise that resolves to an object containing the server host,
 *          server data, and online status if successful, or null if the server is offline or an error occurs.
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
			const errorMessage = replacePlaceholders(
				config.Bot.Messages.errorFetchingData,
				{
					hostname: serverHost.hostname,
					port: String(serverHost.port),
					errorMessage: error.message,
				},
			);
			console.error(errorMessage);
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

	// Check if the message starts with a mention of the bot
	const botMentionRegex = new RegExp(`^<@!?${client.user.id}>`, "i");
	if (!botMentionRegex.test(message.content)) return;

	// Check if the message ends with "setup" (case-insensitive)
	if (!message.content.toLowerCase().endsWith("setup")) return;

	const contentLines = [
		config.Bot.Messages.readyForSetup,
		replacePlaceholders(config.Bot.Messages.channelID, {
			channelId: message.channel.id,
		}),
	];

	const setupMessage = await message.channel.send(contentLines.join("\n"));

	const updatedContentLines = [
		...contentLines,
		replacePlaceholders(config.Bot.Messages.messageID, {
			messageId: setupMessage.id,
		}),
	];

	await setupMessage.edit(updatedContentLines.join("\n"));
}

/**
 * @param {Client<true>} client
 */
async function renameStatusMessage(client) {
	const guildId = config.Monitoring.GuildID;
	const guild = await client.guilds.fetch(guildId);

	if (!guild) {
		throw new Error(
			replacePlaceholders(config.Bot.Messages.errorGuildNotFound, { guildId }),
		);
	}

	const channelId = config.Monitoring.ChannelID;
	const ownerId = config.Bot.OwnerId;

	const [channel, owner] = await Promise.all([
		guild.channels.fetch(channelId),
		guild.members.fetch(ownerId),
	]);

	if (!channel) {
		throw new Error(
			replacePlaceholders(config.Bot.Messages.errorChannelNotFound, {
				channelId,
				guildName: guild.name,
			}),
		);
	}

	if (!channel.isTextBased()) {
		throw new Error(
			replacePlaceholders(config.Bot.Messages.errorChannelNotText, {
				channelName: channel.name,
			}),
		);
	}

	if (!owner) {
		throw new Error(
			replacePlaceholders(config.Bot.Messages.errorMemberNotFound, {
				memberId: ownerId,
				guildName: guild.name,
			}),
		);
	}

	const messageId = config.Monitoring.MessageID;

	const [message, typing] = await Promise.all([
		channel.messages.fetch(messageId),
		channel.sendTyping(),
	]);

	if (!message) {
		throw new Error(
			replacePlaceholders(config.Bot.Messages.errorMessageNotFound, {
				messageId,
				channelName: channel.name,
			}),
		);
	}

	const serversData = await Promise.all(
		config.Mindustry.Servers.map(async (serverHost) =>
			GetMindustryServerStats(serverHost).catch(() => null),
		),
	);

	const totalServers = config.Mindustry.Servers.length;
	const totalPlayers = serversData.reduce((count, server) => {
		if (server?.online) {
			return count + server.players;
		}
		return count;
	}, 0);

	const lastUpdateTime = moment()
		.tz(config.Bot.Timezone)
		.locale(config.Bot.TimeLocale)
		.format(config.Bot.TimeFormat);

	let footerText = replacePlaceholders(config.Bot.Messages.updateFrequency, {
		lastUpdate: lastUpdateTime,
	});
	if (owner) {
		footerText += `\n${replacePlaceholders(config.Bot.Messages.madeBy, {
			ownerTag: owner.user.tag,
		})}`;
	}

	const footerIconURL = owner?.user.displayAvatarURL() || undefined;

	const embed = new EmbedBuilder()
		.setColor(0xffd700)
		.setTitle(config.Bot.Messages.embedTitle)
		.setDescription(
			replacePlaceholders(config.Bot.Messages.embedDescription, {
				totalServers: String(totalServers),
				totalPlayers: String(totalPlayers),
			}),
		)
		.addFields(
			serversData.map((server, index) => {
				const isOnline = Boolean(server?.online);

				const thatServerConfig = config.Mindustry.Servers[index];

				const statusEmoji = isOnline
					? config.Bot.OnlineEmoji
					: config.Bot.OfflineEmoji;

				const serverName = server?.name
					? removeColorCodes(server.name)
					: thatServerConfig?.name || config.Bot.Messages.unknownServer;

				const { hostname, port } = thatServerConfig || {
					hostname: "Unknown hostname",
					port: "Unknown port",
				};

				const currentPlayers = server?.players || "0";
				const playerLimit = server?.playerLimit || "0";

				const map = server?.map || config.Bot.Messages.unknownMap;
				const gamemode =
					server?.gamemode || config.Bot.Messages.unknownGamemode;

				const fieldName = `${statusEmoji}\u2000${serverName}`;

				const fieldValue = replacePlaceholders(
					config.Bot.Messages.serverFieldTemplate,
					{
						hostname,
						port: String(port),
						currentPlayers: String(currentPlayers),
						playerLimit: String(playerLimit),
						map,
						gamemode,
					},
				);

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

	console.log(
		replacePlaceholders(config.Bot.Messages.logMessageChanged, {
			messageId: message.id,
		}),
	);
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
	console.info(
		replacePlaceholders(config.Bot.Messages.logBotReady, {
			botTag: client.user.tag,
		}),
	);

	await botSetStatus(client);

	setInterval(async () => {
		await botSetStatus(client);
	}, 30 * 60 * 1000); // Update status every 30 minutes

	await renameStatusMessage(client);

	setInterval(async () => {
		await renameStatusMessage(client);
	}, 65 * 1000); // Update server status every 65 seconds
}

new MinServerMonBot().init();
