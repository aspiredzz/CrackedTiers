// ============================================================
// CDTIERS Bot - /clearqueue
// Staff only. Wipes the entire queue without closing it.
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const config = require('../config/config');
const runtimeConfig = require('../utils/runtimeConfig');
const queueManager = require('../utils/queueManager');
const roleManager = require('../utils/roleManager');
const channelManager = require('../utils/channelManager');
const queueDisplay = require('../utils/queueDisplay');
const { isStaff } = require('../utils/permissions');
const { logger } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearqueue')
    .setDescription('Clear every player from the queue (Staff only)'),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const players = queueManager.getAllPlayers();
    for (const player of players) {
      try {
        const member = await interaction.guild.members.fetch(player.discord_id).catch(() => null);
        if (member) {
          await roleManager.removeWaitlistRole(member, config.waitlistRoleId);
          await channelManager.revokePrivateAccess(
            interaction.guild,
            member,
            runtimeConfig.getPrivateQueueChannelId()
          );
        }
      } catch (err) {
        logger.error(`Failed to clean up player ${player.discord_id} on clearqueue: ${err.message}`);
      }
    }

    queueManager.clearQueue();
    await queueDisplay.refreshAll(interaction.client);

    await interaction.editReply({ content: '🧹 Queue cleared.' });
  },
};
