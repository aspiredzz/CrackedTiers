const { SlashCommandBuilder } = require('discord.js');
const config = require('../config/config');
const runtimeConfig = require('../utils/runtimeConfig');
const queueManager = require('../utils/queueManager');
const roleManager = require('../utils/roleManager');
const channelManager = require('../utils/channelManager');
const queueDisplay = require('../utils/queueDisplay');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skipplayer')
    .setDescription('Skip a player in the queue without testing them (Staff only)')
    .addUserOption((option) =>
      option.setName('player').setDescription('The player to skip').setRequired(true)
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('player');

    if (!queueManager.isInQueue(target.id)) {
      return interaction.reply({
        content: `⚠️ <@${target.id}> is not currently in the queue.`,
        ephemeral: true,
      });
    }

    queueManager.removePlayer(target.id);

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member) {
      await roleManager.removeWaitlistRole(member, runtimeConfig.getWaitlistRoleId());
      await channelManager.revokePrivateAccess(interaction.guild, member, runtimeConfig.getPrivateQueueChannelId());
    }

    try {
      const privateChannel = await interaction.guild.channels
        .fetch(runtimeConfig.getPrivateQueueChannelId())
        .catch(() => null);
      if (privateChannel) {
        await privateChannel.send({
          content: `⏭️ <@${target.id}> has been skipped in the queue by staff.`,
        });
      }
    } catch (err) {
      // Non-fatal.
    }

    await queueDisplay.refreshAll(interaction.client);

    await interaction.reply({
      content: `✅ Skipped <@${target.id}>.`,
      ephemeral: true,
    });
  },
};
