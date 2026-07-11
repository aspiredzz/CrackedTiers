// ============================================================
// CDTIERS Bot - /setjoinwaitlistchannel
// Staff only. Sets the channel where the "Join Waitlist" panel
// lives, then immediately posts that panel (title, description,
// and an "Enter Waitlist" button) into the channel.
// Self-contained: the embed is built inline here so there is no
// separate embeds file that can go missing.
// ============================================================

const {
  SlashCommandBuilder,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const config = require('../config/config');
const runtimeConfig = require('../utils/runtimeConfig');
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

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('📝 Evaluation Testing Waitlist')
      .setDescription(
        [
          'Click **Enter Waitlist** below to join the CDTIERS testing queue.',
          '',
          'Once you join, you will automatically get access to the private queue channel,',
          'where you will be pinged when a tester is ready for you.',
          '',
          '• Make sure the account you want tested is the one you are logged in as on Discord.',
          '• Be ready to join a call/report to the tester promptly once it is your turn.',
          '',
          '❗ Leaving mid-test or providing false information may result in a denied test.',
        ].join('\n')
      )
      .setFooter({ text: config.brand })
      .setTimestamp();

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
