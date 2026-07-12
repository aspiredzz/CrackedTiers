const { logger } = require('../utils/logger');
const joinQueueButton = require('../buttons/joinQueue');
const leaveQueueButton = require('../buttons/leaveQueue');

const buttonHandlers = new Map([
  [joinQueueButton.customId, joinQueueButton.execute],
  [leaveQueueButton.customId, leaveQueueButton.execute],
]);

module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        return;
      }

      if (interaction.isButton()) {
        const handler = buttonHandlers.get(interaction.customId);
        if (!handler) return;
        await handler(interaction);
        return;
      }
    } catch (err) {
      logger.error(`Interaction error: ${err.stack || err.message}`);
      const payload = {
        content: '❌ An error occurred while processing this interaction.',
        ephemeral: true,
      };
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(payload);
        } else {
          await interaction.reply(payload);
        }
      } catch (_) {
        // Interaction likely expired - nothing more we can do.
      }
    }
  },
};
