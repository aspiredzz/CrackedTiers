const { SlashCommandBuilder } = require('discord.js');
const queueManager = require('../utils/queueManager');
const queueDisplay = require('../utils/queueDisplay');
const runtimeConfig = require('../utils/runtimeConfig');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startqueue')
    .setDescription('Start the testing queue with no specific gamemode (Staff only)'),

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
      return interaction.reply({
        content: `⚠️ A queue is already open (started by <@${state.active_tester_id}>). Have them run \`/close\` first.`,
        ephemeral: true,
      });
    }

    queueManager.setQueueOpen(true, interaction.user.id, interaction.user.tag);
    queueManager.unlockCapacity();
    await queueDisplay.refreshAll(interaction.client);

    await interaction.reply({
      content: `✅ Queue started! You are now the active tester. Tip: use \`/queue\` instead if you want it to ping a specific gamemode role.`,
      ephemeral: true,
    });
  },
};
