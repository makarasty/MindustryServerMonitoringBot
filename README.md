# Mindustry Server Monitoring Discord Bot

![Bot Banner](https://github.com/user-attachments/assets/941be9f2-6f8c-4e51-967c-ba9b36d96032)

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
- **User-Friendly Configuration:** Easily set up and manage server IDs, channel IDs, and other settings via a configuration file and setup commands.
- **Error Handling:** Robust error management to handle scenarios like missing guilds, channels, or messages gracefully.

## Prerequisites

Before setting up the bot, ensure you have the following:

- **Node.js:** Version 16.9.0 or higher. [Download Node.js](https://nodejs.org/)
- **Discord Bot Token:** You can create a bot and obtain its token from the [Discord Developer Portal](https://discord.com/developers/applications).
- **Mindustry Server Details:** Hostnames and ports of the Mindustry servers you wish to monitor.
- **Git:** For cloning the repository. [Download Git](https://git-scm.com/)
- **Environment Variables Management:** It's recommended to use a `.env` file to securely manage your bot's token and other sensitive information. You can use the [dotenv](https://www.npmjs.com/package/dotenv) package for this purpose.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/makarasty/MindustryServerMonitoringBot.git
   cd MindustryServerMonitoringBot
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

   This will install all necessary packages, including `discord.js`, `mindustry.js`, and `moment-timezone`.

3. **Set Up Environment Variables:**

   Create a `.env` file in the root directory of the project to securely store your Discord bot token.

   ```bash
   touch .env
   ```

   Open the `.env` file and add your bot token:

   ```env
   TOKEN=YOUR_DISCORD_BOT_TOKEN_HERE
   ```

   **Note:** Replace `YOUR_DISCORD_BOT_TOKEN_HERE` with your actual Discord bot token. **Never** share your bot token publicly.

4. **Set Up Configuration:**

   Edit the `config.js` file in the root directory of the project to configure your servers and bot settings.

## Configuration

Configure the bot by editing the `config.js` file. Below is an example structure based on your provided configuration:

```javascript
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
			{
				name: "Мертвий сервер",
				hostname: "194.247.42.132",
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

- **Bot.Messages:**
  - `readyForSetup`: Message displayed when initiating setup.
  - `channelID`: Template for displaying the channel ID during setup.
  - `messageID`: Template for displaying the message ID after setup.
  - `unknownServer`: Default text for unknown servers.
  - `unknownMap`: Default text for unknown maps.
  - `unknownGamemode`: Default text for unknown game modes.
  - `updateFrequency`: Template for footer text indicating update frequency and last update time.
  - `madeBy`: Template for footer text indicating the bot's creator.
  - `embedTitle`: Title of the embed message.
  - `embedDescription`: Description of the embed message, displaying total servers and players.
  - `serverFieldTemplate`: Template for each server's field in the embed.
  - **Error Messages:**
    - `errorGuildNotFound`
    - `errorChannelNotFound`
    - `errorChannelNotText`
    - `errorMemberNotFound`
    - `errorMessageNotFound`
    - `errorFetchingData`
  - **Logging Messages:**
    - `logBotReady`: Log message when the bot is ready.
    - `logMessageChanged`: Log message when the embed message is successfully updated.

**Note:** Ensure that your `config.js` exports the configuration correctly and that all necessary dependencies (like `ActivityType` from `discord.js`) are imported as shown.

## Usage

1. **Start the Bot:**

   ```bash
   node index.js
   ```

   Ensure that `index.js` is your main entry file. Adjust the command if your main file has a different name.

2. **Initial Setup:**

   To configure the bot within your Discord server, use the setup command by mentioning the bot followed by the keyword `setup`. For example:

   ```
   @BotName setup
   ```

   **Steps:**

   - **Send Setup Command:** In the desired text channel, mention the bot and append the word `setup` to initiate the setup process.

     ```
     @BotName setup
     ```

   - **Receive Setup Confirmation:** The bot will respond with a confirmation message indicating that the setup is ready, along with the `channelID`.

     ```
     Це повідомлення готове до налаштувань!
     **channelID:** `1260207524360097823`
     ```

   - **Message ID Retrieval:** The bot will then edit the setup message to include the `messageID` which is used to track and update the server statuses.

     ```
     Це повідомлення готове до налаштувань!
     **channelID:** `1260207524360097823`
     **messageID:** `1260207710876602409`
     ```

   - **Finalize Configuration:** Ensure that the retrieved `messageID` is correctly placed in your `config.js` under the `Monitoring.MessageID` field.

3. **Bot Functionality:**

   - **Embed Message Updates:** The bot will automatically update the specified message with real-time server statistics at regular intervals (every 65 seconds by default).
   - **Status Updates:** The bot's status message will refresh every 30 minutes to reflect any changes or updates.
   - **Error Handling:** Any issues with fetching server data or configuration will be logged for troubleshooting.

4. **Adding the Bot to Your Server:**

   If you haven't added the bot to your Discord server yet, generate an invite link from the [Discord Developer Portal](https://discord.com/developers/applications) with the necessary permissions and invite it to your server.

   **Permissions Required:**

   - Read Messages
   - Send Messages
   - Embed Links
   - Manage Messages
   - Read Message History

## License

This project is licensed under the [MIT License](LICENSE).
