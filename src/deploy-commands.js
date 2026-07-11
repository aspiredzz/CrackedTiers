const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('./config/config');
const { logger } = require('./utils/logger');

if (!config.token || !config.clientId) {
  logger.error('DISCORD_TOKEN and CLIENT_ID must be set in your environment. Exiting.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const files = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of files) {
  const command = require(path.join(commandsPath, file));
  if (command?.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    logger.info(`Deploying ${commands.length} slash command(s)...`);

    if (config.guildId) {
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
        body: commands,
      });
      logger.info(`Successfully deployed commands to guild ${config.guildId}.`);
    } else {
      await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
      logger.info('Successfully deployed commands globally.');
    }
  } catch (err) {
    logger.error(`Failed to deploy commands: ${err.message}`);
    process.exit(1);
  }
})();
