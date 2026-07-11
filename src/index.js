const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config/config');
const { loadCommands } = require('./handlers/commandHandler');
const { loadEvents } = require('./handlers/eventHandler');
const { startServer } = require('./utils/server');
const { logger } = require('./utils/logger');

if (!config.token || !config.clientId) {
  logger.error('DISCORD_TOKEN and CLIENT_ID must be set in your environment. Exiting.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

loadCommands(client);
loadEvents(client);

// Start the Express health server + self-pinger (independent of the Discord client).
startServer();

client.login(config.token).catch((err) => {
  logger.error(`Failed to log in: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled promise rejection: ${err?.stack || err}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err?.stack || err}`);
});
