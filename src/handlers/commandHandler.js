// ============================================================
// CDTIERS Bot - Command Handler
// Loads every file in src/commands into client.commands.
// ============================================================

const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const { logger } = require('../utils/logger');

function loadCommands(client) {
  client.commands = new Collection();

  const commandsPath = path.join(__dirname, '..', 'commands');
  const files = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    const command = require(path.join(commandsPath, file));
    if (command?.data && typeof command.execute === 'function') {
      client.commands.set(command.data.name, command);
      logger.info(`Loaded command: /${command.data.name}`);
    } else {
      logger.warn(`Skipped invalid command file: ${file}`);
    }
  }
}

module.exports = { loadCommands };
