// ============================================================
// CDTIERS Bot - Command Handler
// Loads and registers slash commands.
// ============================================================

const fs = require('fs');
const path = require('path');
const {
  Collection,
  REST,
  Routes,
} = require('discord.js');

const config = require('../config/config');
const { logger } = require('../utils/logger');

async function loadCommands(client) {
  client.commands = new Collection();

  const commands = [];
  const commandsPath = path.join(__dirname, '..', 'commands');
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const command = require(path.join(commandsPath, file));

    if (command?.data && typeof command.execute === 'function') {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());

      logger.info(`Loaded command: /${command.data.name}`);
    } else {
      logger.warn(`Skipped invalid command file: ${file}`);
    }
  }

  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    logger.info('Registering slash commands...');

    if (config.guildId) {
      await rest.put(
        Routes.applicationGuildCommands(
          config.clientId,
          config.guildId
        ),
        {
          body: commands,
        }
      );

      logger.info('Successfully registered guild slash commands.');
    } else {
      await rest.put(
        Routes.applicationCommands(config.clientId),
        {
          body: commands,
        }
      );

      logger.info('Successfully registered global slash commands.');
    }
  } catch (err) {
    logger.error(`Failed to register commands: ${err.stack || err}`);
  }
}

module.exports = {
  loadCommands,
};
