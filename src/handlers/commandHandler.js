const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const { logger } = require('../utils/logger');

function loadCommands(client) {
  client.commands = new Collection();

  const commandsPath = path.join(__dirname, '..', 'commands');
  const files = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    try {
      const command = require(path.join(commandsPath, file));
      if (command?.data && typeof command.execute === 'function') {
        client.commands.set(command.data.name, command);
        logger.info(`Loaded command: /${command.data.name}`);
      } else {
        logger.warn(`Skipped invalid command file (bad shape): ${file}`);
      }
    } catch (err) {
      // A single broken command file (e.g. missing dependency) should never
      // take down the whole bot - log it clearly and keep loading the rest.
      logger.error(`Failed to load command file "${file}": ${err.message}`);
    }
  }
}

module.exports = { loadCommands };
