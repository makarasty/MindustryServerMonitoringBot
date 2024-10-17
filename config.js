const { ActivityType } = require("discord.js");

const config = {
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
		],
	},

	Monitoring: {
		GuildID: "1244734490702512208",
		ChannelID: "1260207524360097823",
		MessageID: "1260207710876602409",
	},

	Bot: {
		Status: {
			text: "Слідкую за серверами mindustry",
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
	},
};

module.exports = config;
