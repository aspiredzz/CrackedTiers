// ============================================================
// CDTIERS Bot - /setqueuechannel
// Staff only. Sets (or changes) the public queue channel where
// the live "Evaluation Testing Waitlist" embed and buttons are
// posted. Persisted, so it survives restarts and doesn't need a
// redeploy to change.
// ============================================================

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const runtimeConfig = require('../utils/runtimeConfig');
const queueDisplay = require('../utils/queueDisplay');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setqueuechannel')
    .setDescription('Set the public queue channel (Staff only)')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel to use as the public queue channel')
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
    runtimeConfig.setQueueChannelId(channel.id);

    // Immediately reflect the current queue state in the newly-set channel.
    await queueDisplay.refreshAll(interaction.client);

    await interaction.reply({
      content: `✅ Queue channel set to <#${channel.id}>.`,
      ephemeral: true,
    });
  },
};
