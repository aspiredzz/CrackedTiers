// ============================================================
// CDTIERS Bot - /startqueue
// Staff only. Opens the queue and sets the executing staff
// member as the active tester.
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const queueManager = require('../utils/queueManager');
const queueDisplay = require('../utils/queueDisplay');
const { isStaff } = require('../utils/permissions');

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

    const state = queueManager.getState();
    if (state.is_open) {
      return interaction.reply({ content: '⚠️ The queue is already open.', ephemeral: true });
    }

    queueManager.setQueueOpen(true, interaction.user.id, interaction.user.tag);
    await queueDisplay.refreshAll(interaction.client);

    await interaction.reply({
      content: `✅ Queue started! You are now the active tester.`,
      ephemeral: true,
    });
  },
};
