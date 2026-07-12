const { PermissionFlagsBits } = require('discord.js');
const runtimeConfig = require('./runtimeConfig');
const queueManager = require('./queueManager');
const roleManager = require('./roleManager');
const channelManager = require('./channelManager');
const queueDisplay = require('./queueDisplay');
const { logger } = require('./logger');

// Returns null if the closer is allowed to proceed, or a rejection message
// if they're not. Only the tester who opened the queue (or a real
// Administrator) can close it - stops one tester from yanking another
// tester's queue out from under them.
function checkCanClose(interaction, state) {
  if (interaction.user.id === state.active_tester_id) return null;
  if (interaction.member.permissions?.has(PermissionFlagsBits.Administrator)) return null;
  return `❌ Only <@${state.active_tester_id}> can close this queue.`;
}

async function closeQueue(interaction) {
  const state = queueManager.getState();
  if (!state.is_open) {
    return { ok: false, message: '⚠️ The queue is already closed.' };
  }

  const rejection = checkCanClose(interaction, state);
  if (rejection) {
    return { ok: false, message: rejection };
  }

  const players = queueManager.getAllPlayers();
  for (const player of players) {
    try {
      const member = await interaction.guild.members.fetch(player.discord_id).catch(() => null);
      if (member) {
        await roleManager.removeWaitlistRole(member, runtimeConfig.getWaitlistRoleId());
        await channelManager.revokePrivateAccess(
          interaction.guild,
          member,
          runtimeConfig.getPrivateQueueChannelId()
        );
      }
    } catch (err) {
      logger.error(`Failed to clean up player ${player.discord_id} on close: ${err.message}`);
    }
  }

  queueManager.clearQueue();
  queueManager.setLastSessionEnded(Date.now());
  queueManager.setQueueOpen(false, null, null);
  queueManager.unlockCapacity();
  queueManager.clearActiveGamemode();
  await queueDisplay.refreshAll(interaction.client);

  return { ok: true, message: '🛑 Queue closed and cleared.' };
}

module.exports = { closeQueue };
