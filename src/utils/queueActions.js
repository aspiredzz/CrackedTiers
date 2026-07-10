// ============================================================
// CDTIERS Bot - Shared Queue Actions
// Both the /requesttest slash command and the "Enter Waitlist"
// button call these same functions so behavior never drifts
// between the two entry points.
// ============================================================

const config = require('../config/config');
const queueManager = require('./queueManager');
const roleManager = require('./roleManager');
const channelManager = require('./channelManager');
const queueDisplay = require('./queueDisplay');
const { logger } = require('./logger');

async function joinQueue(interaction) {
  const state = queueManager.getState();

  if (!state.is_open) {
    return interaction.reply({ content: '❌ The queue is currently closed.', ephemeral: true });
  }

  if (queueManager.isInQueue(interaction.user.id)) {
    return interaction.reply({ content: '⚠️ You are already in the queue.', ephemeral: true });
  }

  if (queueManager.getPlayerCount() >= config.maxQueueSize) {
    return interaction.reply({ content: '❌ The queue is currently full.', ephemeral: true });
  }

  queueManager.addPlayer(interaction.user.id, interaction.user.username, interaction.user.tag);

  const member = interaction.member;
  await roleManager.giveWaitlistRole(member, config.waitlistRoleId);
  await channelManager.grantPrivateAccess(interaction.guild, member, config.privateQueueChannelId);
  await queueDisplay.refreshAll(interaction.client);

  const position = queueManager.getPosition(interaction.user.id);

  await interaction.reply({
    content: `✅ You have joined the testing queue! Your position: **${position}**.`,
    ephemeral: true,
  });

  try {
    const privateChannel = await interaction.guild.channels
      .fetch(config.privateQueueChannelId)
      .catch(() => null);
    if (privateChannel) {
      await privateChannel.send({
        content: `👋 Welcome <@${interaction.user.id}>! You are position **${position}** in the queue.`,
      });
    }
  } catch (err) {
    logger.error(`Failed to send welcome message: ${err.message}`);
  }
}

async function leaveQueue(interaction) {
  if (!queueManager.isInQueue(interaction.user.id)) {
    return interaction.reply({ content: '⚠️ You are not currently in the queue.', ephemeral: true });
  }

  queueManager.removePlayer(interaction.user.id);

  const member = interaction.member;
  await roleManager.removeWaitlistRole(member, config.waitlistRoleId);
  await channelManager.revokePrivateAccess(interaction.guild, member, config.privateQueueChannelId);
  await queueDisplay.refreshAll(interaction.client);

  await interaction.reply({ content: '✅ You have left the testing queue.', ephemeral: true });
}

module.exports = { joinQueue, leaveQueue };
