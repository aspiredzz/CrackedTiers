// ============================================================
// CDTIERS Bot - /setjoinwaitlistchannel
// Staff only. Sets the channel where the "Join Waitlist" panel
// lives, then immediately posts that panel (title, description,
// and an "Enter Waitlist" button) into the channel.
// ============================================================

const {
  SlashCommandBuilder,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const runtimeConfig = require('../utils/runtimeConfig');
const { buildJoinWaitlistPanelEmbed } = require('../embeds/joinWaitlistPanelEmbed');
const { isStaff } = require('../utils/permissions');
const { logger } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setjoinwaitlistchannel')
    .setDescription('Set the channel that shows the Join Waitlist panel (Staff only)')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel to post the Join Waitlist panel in')
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
    runtimeConfig.setJoinWaitlistChannelId(channel.id);

    const embed = buildJoinWaitlistPanelEmbed();
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('join_queue')
        .setLabel('Enter Waitlist')
        .setStyle(ButtonStyle.Primary)
    );

    try {
      await channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      logger.error(`Failed to post join waitlist panel: ${err.message}`);
      return interaction.reply({
        content:
          '⚠️ Channel saved, but I could not post the panel there. Make sure I have View Channel and Send Messages permissions in that channel.',
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: `✅ Join Waitlist panel posted in <#${channel.id}>.`,
      ephemeral: true,
    });
  },
};
