const { ActivityType } = require("discord.js");

module.exports = {
	Mindustry: {
		Servers: [
			{
				name: null,
				hostname: "194.247.42.131",
				port: 27715,
			},
			{
				name: null,
				hostname: "194.247.42.131",
				port: 27512,
			},
			{
				name: null,
				hostname: "194.247.42.130",
				port: 27505,
			},
			// Додайте більше серверів за потребою
		],
	},

	Monitoring: {
		GuildID: "1244734490702512208",
		ChannelID: "1260207524360097823",
		MessageID: "1260207710876602409",
	},

	Bot: {
		Status: {
			text: "слідкую за серверами mindustry",
			options: {
				type: ActivityType.Watching,
				url: "https://www.twitch.tv/makarasty",
			},
		},

		OwnerId: "509734900182548489",

		Timezone: "Europe/Kiev",
		TimeLocale: "uk",
		TimeFormat: "DD.MM HH:mm:ss",

		OnlineEmoji: "<a:online:1260198905564499990>",
		OfflineEmoji: "<a:offline:1260198907053609113>",

		Messages: {
			readyForSetup: "Це повідомлення готове до налаштувань!",
			channelID: "**channelID:** `{channelId}`",
			messageID: "**messageID:** `{messageId}`",
			unknownServer: "Невідомий сервер",
			unknownMap: "Невідома карта",
			unknownGamemode: "Невідомий режим",
			updateFrequency: "Оновлення кожну хвилину. В останнє: {lastUpdate}",
			madeBy: "Створено: {ownerTag}",
			embedTitle: "Моніторинг серверів Mindustry",
			embedDescription:
				"**Серверів**: `{totalServers}`, **Гравців**: `{totalPlayers}`",
			serverFieldTemplate:
				"`{hostname}:{port}` **-** **Гравців**: `{currentPlayers}`/`{playerLimit}`\n**Карта**: `{map}` **/** `{gamemode}`",
			errorGuildNotFound: "Сервер з ID {guildId} не знайдено.",
			errorChannelNotFound:
				"Канал з ID {channelId} не знайдено на сервері {guildName}.",
			errorChannelNotText: "Канал {channelName} не є текстовим каналом.",
			errorMemberNotFound:
				"Член з ID {memberId} не знайдений на сервері {guildName}.",
			errorMessageNotFound:
				"Повідомлення з ID {messageId} не знайдено в каналі {channelName}.",
			logBotReady: "Discord бот готовий як користувач: {botTag}",
			logMessageChanged: "Повідомлення успішно змінено!",
			errorFetchingData:
				"Помилка при отриманні даних з сервера {hostname}:{port} - {errorMessage}",
		},
	},
};
