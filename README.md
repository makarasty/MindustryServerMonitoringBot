# Mindustry Server Monitoring Discord Bot

![image](https://github.com/user-attachments/assets/93c34b51-cb7c-4161-ad79-5842574b99a2)

A Discord bot built with Discord.js to monitor and display the status of Mindustry game servers. It provides real-time updates on server activity, player counts, and other vital statistics directly within your Discord server.

## Table of Contents

- [Mindustry Server Monitoring Discord Bot](#mindustry-server-monitoring-discord-bot)
	- [Table of Contents](#table-of-contents)
	- [Features](#features)
	- [Prerequisites](#prerequisites)
	- [Installation](#installation)
	- [Configuration](#configuration)
		- [Configuration Fields:](#configuration-fields)
	- [Usage](#usage)
	- [License](#license)

## Features

- **Real-Time Monitoring:** Continuously tracks the status of multiple Mindustry servers.
- **Comprehensive Embeds:** Displays detailed server information including player counts, maps, game modes, and more using Discord embeds.
- **Automated Updates:** Refreshes server data at regular intervals (e.g., every minute) to ensure up-to-date information.
- **Customizable Alerts:** Sends notifications for server status changes (online/offline).
- **User-Friendly Configuration:** Easily set up and manage server IDs, channel IDs, and other settings via a configuration file.
- **Error Handling:** Robust error management to handle scenarios like missing guilds, channels, or messages gracefully.

## Prerequisites

Before setting up the bot, ensure you have the following:

- **Node.js:** Version 16.9.0 or higher. [Download Node.js](https://nodejs.org/)
- **Discord Bot Token:** You can create a bot and obtain its token from the [Discord Developer Portal](https://discord.com/developers/applications).
- **Mindustry Server Details:** Hostnames and ports of the Mindustry servers you wish to monitor.
- **Git:** For cloning the repository. [Download Git](https://git-scm.com/)

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/makarasty/MindustryServerMonitoringBot
   cd MindustryServerMonitoringBot
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

   This will install all necessary packages, including `discord.js` and `moment-timezone`.

3. **Set Up Configuration:**

   Edit the `config.json` file in the root directory of the project.

## Configuration

Configure the bot by editing the `config.json` file. Below is an example structure:

```js
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
			// Add more servers as needed
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
```

### Configuration Fields:

- **Mindustry:**
  - `Servers`: An array of server objects containing:
    - `name`: The display name of the server. If set to `null`, the bot will default to a generic name or use another identifier.
    - `hostname`: The IP address or hostname of the Mindustry server.
    - `port`: The port number on which the Mindustry server is running.

- **Monitoring:**
  - `GuildID`: The ID of the Discord guild (server) where the bot operates.
  - `ChannelID`: The ID of the channel where the bot will send embeds.
  - `MessageID`: The ID of the message that the bot will edit with server statuses.

- **Bot:**
  - `Status`:
    - `text`: The status message the bot displays (e.g., "Watching over Mindustry servers").
    - `options`:
      - `type`: The type of activity (e.g., `ActivityType.Watching`).
      - `url`: The URL associated with the activity, if any (e.g., a Twitch stream).
  - `OwnerId`: The Discord user ID of the bot owner. This can be used for permissions or special commands.
  - `Timezone`: The timezone for timestamp formatting (e.g., `Europe/Kiev`).
  - `TimeLocale`: Locale for time formatting (e.g., `uk` for Ukrainian).
  - `TimeFormat`: [Moment.js](https://momentjs.com/docs/#/displaying/format/) format string for displaying the time.
  - `OnlineEmoji`: Emoji representing an online server (use Discord custom emoji format).
  - `OfflineEmoji`: Emoji representing an offline server (use Discord custom emoji format).

**Note:** Ensure that your `config.js` exports the configuration correctly and that all necessary dependencies (like `ActivityType` from `discord.js`) are imported as shown.

## Usage

1. **Start the Bot:**

   ```bash
   node index.js
   ```

   Ensure that `index.js` is your main entry file. Adjust the command if your main file has a different name.

2. **Bot Functionality:**

   - The bot will fetch the specified guild, channel, and message upon startup.
   - It will periodically update the embed message with the latest server statistics.
   - Typing indicators and error messages will be handled gracefully to inform users of the bot's status.

3. **Adding the Bot to Your Server:**

   If you haven't added the bot to your Discord server yet, generate an invite link from the [Discord Developer Portal](https://discord.com/developers/applications) with the necessary permissions and invite it to your server.

## License

This project is licensed under the [MIT License](LICENSE).
