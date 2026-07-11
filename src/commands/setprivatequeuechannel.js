// ============================================================
// CDTIERS Bot - /setprivatequeuechannel
// Staff only. Sets the private channel that queued players get
// access to (and lose access to when they leave/finish/get
// removed). This is where the live queue board is maintained.
// ============================================================

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const runtimeConfig = require('../utils/runtimeConfig');
const queueDisplay = require('../utils/queueDisplay');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setprivatequeuechannel')
    .setDescription('Set the private channel queued players get access to (Staff only)')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The private channel used as the live queue board')
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
    runtimeConfig.setPrivateQueueChannelId(channel.id);

    await queueDisplay.refreshBoard(interaction.client);

    await interaction.reply({
      content: `✅ Private queue channel set to <#${channel.id}>. Make sure that channel is locked down (staff-only) by default in its permissions - the bot grants access to players individually as they join the queue.`,
      ephemeral: true,
    });
  },
};
