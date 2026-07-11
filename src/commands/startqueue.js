const { SlashCommandBuilder } = require('discord.js');
const queueManager = require('../utils/queueManager');
const queueDisplay = require('../utils/queueDisplay');
const runtimeConfig = require('../utils/runtimeConfig');
const { isStaff } = require('../utils/permissions');
const { logger } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startqueue')
    .setDescription('Start the testing queue (Staff only)'),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const queueChannelId = runtimeConfig.getQueueChannelId();
    if (!queueChannelId) {
      return interaction.reply({
        content: '❌ No queue channel is set yet. Run `/setqueuechannel` first, then try again.',
        ephemeral: true,
      });
    }

    const state = queueManager.getState();
    if (state.is_open) {
      return interaction.reply({ content: '⚠️ The queue is already open.', ephemeral: true });
    }

    queueManager.setQueueOpen(true, interaction.user.id, interaction.user.tag);
    queueManager.unlockCapacity();
    await queueDisplay.refreshAll(interaction.client);

    try {
      const queueChannel = await interaction.client.channels.fetch(queueChannelId).catch(() => null);
      if (queueChannel) {
        await queueChannel.send({
          content: `@here The queue is now open! Use \`/requesttest\` or click **Enter Waitlist** to join.`,
          allowedMentions: { parse: ['everyone'] },
        });
      }
    } catch (err) {
      logger.error(`Failed to send @here queue-open ping: ${err.message}`);
    }

    await interaction.reply({
      content: `✅ Queue started! You are now the active tester.`,
      ephemeral: true,
    });
  },
};
