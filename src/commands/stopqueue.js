// ============================================================
// CDTIERS Bot - /stopqueue
// Staff only. Closes the queue, clears every queued player,
// strips the WAITLIST/QUEUE role + private channel access from
// all of them, and restores the "No Testers Online" embed.
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
    .setName('stopqueue')
    .setDescription('Stop the testing queue (Staff only)'),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const state = queueManager.getState();
    if (!state.is_open) {
      return interaction.reply({ content: '⚠️ The queue is already closed.', ephemeral: true });
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
        logger.error(`Failed to clean up player ${player.discord_id} on stopqueue: ${err.message}`);
      }
    }

    queueManager.clearQueue();
    queueManager.setLastSessionEnded(Date.now());
    queueManager.setQueueOpen(false, null, null);
    await queueDisplay.refreshAll(interaction.client);

    await interaction.editReply({ content: '🛑 Queue stopped and cleared.' });
  },
};
