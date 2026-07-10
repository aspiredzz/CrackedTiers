// ============================================================
// CDTIERS Bot - Entry Point
// ============================================================

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
  partials: [
    Partials.Channel,
    Partials.Message,
  ],
});

async function startBot() {
  try {
    // Load & register slash commands
    await loadCommands(client);

    // Load events
    loadEvents(client);

    // Start Express health server
    startServer();

    // Login to Discord
    await client.login(config.token);

    logger.info('Bot startup complete.');
  } catch (err) {
    logger.error(`Startup failed: ${err.stack || err}`);
    process.exit(1);
  }
}

startBot();

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled promise rejection: ${err?.stack || err}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err?.stack || err}`);
});
