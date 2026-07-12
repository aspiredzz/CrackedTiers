const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const runtimeConfig = require('../utils/runtimeConfig');
const { setupGameModeEmojis } = require('../utils/emojiManager');
const { ensureGameModeRoles, buildRolePanelEmbed, addPanelReactions } = require('../utils/reactionRoles');
const { isStaff } = require('../utils/permissions');
const { logger } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setrolechannel')
    .setDescription('Post the gamemode role-select panel in a channel (Staff only)')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel to post the role panel in')
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

    const botMember = await interaction.guild.members.fetchMe();
    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: '❌ I need the **Manage Roles** permission to create and assign gamemode roles.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    await setupGameModeEmojis(interaction.guild);
    const roleResults = await ensureGameModeRoles(interaction.guild);

    const channel = interaction.options.getChannel('channel');
    const embed = buildRolePanelEmbed();

    let message;
    try {
      message = await channel.send({ embeds: [embed] });
      await addPanelReactions(message);
    } catch (err) {
      logger.error(`Failed to post role panel: ${err.message}`);
      return interaction.editReply({
        content: '❌ Failed to post the role panel. Make sure I can send messages and add reactions in that channel.',
      });
    }

    runtimeConfig.setRolePanel(channel.id, message.id);

    const failed = roleResults.filter((r) => !r.success);
    const summary =
      failed.length > 0
        ? `⚠️ Panel posted in <#${channel.id}>, but ${failed.length} role(s) failed to set up: ${failed.map((f) => f.label).join(', ')}.`
        : `✅ Role panel posted in <#${channel.id}>. React to get roles, unreact to remove them.`;

    await interaction.editReply({ content: summary });
  },
};
