// ============================================================
// CDTIERS Bot - /setresultchannel
// Staff only. Sets the channel where /results posts test result
// embeds. Persisted, no redeploy needed.
// ============================================================

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const runtimeConfig = require('../utils/runtimeConfig');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setresultchannel')
    .setDescription('Set the channel where test results are posted (Staff only)')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel to post test results in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const channel = interaction.options.getChannel('channel');
    runtimeConfig.setResultsChannelId(channel.id);

    await interaction.reply({
      content: `✅ Results channel set to <#${channel.id}>.`,
      ephemeral: true,
    });
  },
};
