const { SlashCommandBuilder } = require('discord.js');
const { closeQueue } = require('../utils/queueSession');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close your queue (Staff only)'),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });
    const result = await closeQueue(interaction);
    await interaction.editReply({ content: result.message });
  },
};
