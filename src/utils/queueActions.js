const config = require('../config/config');
const runtimeConfig = require('./runtimeConfig');
const queueManager = require('./queueManager');
const roleManager = require('./roleManager');
const channelManager = require('./channelManager');
const queueDisplay = require('./queueDisplay');
const { logger } = require('./logger');

async function joinQueue(interaction) {
  if (queueManager.isInQueue(interaction.user.id)) {
    return interaction.reply({ content: '⚠️ You are already in the queue.', ephemeral: true });
  }

  if (queueManager.isCapacityLocked()) {
    return interaction.reply({
      content: '❌ The queue filled up for this session. Please wait for the next queue.',
      ephemeral: true,
    });
  }

  if (queueManager.getPlayerCount() >= config.maxQueueSize) {
    queueManager.lockCapacity();
    return interaction.reply({
      content: '❌ The queue just filled up. Please wait for the next queue.',
      ephemeral: true,
    });
  }

  queueManager.addPlayer(interaction.user.id, interaction.user.username, interaction.user.tag);

  if (queueManager.getPlayerCount() >= config.maxQueueSize) {
    queueManager.lockCapacity();
  }

  const privateQueueChannelId = runtimeConfig.getPrivateQueueChannelId();
  const member = interaction.member;
  await roleManager.giveWaitlistRole(member, runtimeConfig.getWaitlistRoleId());
  await channelManager.grantPrivateAccess(interaction.guild, member, privateQueueChannelId);
  await queueDisplay.refreshAll(interaction.client);

  const position = queueManager.getPosition(interaction.user.id);

  await interaction.reply({ content: '✅ You have joined the waitlist.', ephemeral: true });

  try {
    if (privateQueueChannelId) {
      const privateChannel = await interaction.guild.channels
        .fetch(privateQueueChannelId)
        .catch(() => null);
      if (privateChannel) {
        await privateChannel.send({
          content: `👋 Welcome <@${interaction.user.id}>! You are position **${position}** in the queue.`,
        });
      }
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
  await roleManager.removeWaitlistRole(member, runtimeConfig.getWaitlistRoleId());
  await channelManager.revokePrivateAccess(
    interaction.guild,
    member,
    runtimeConfig.getPrivateQueueChannelId()
  );
  await queueDisplay.refreshAll(interaction.client);

  await interaction.reply({ content: '✅ You have left the testing queue.', ephemeral: true });
}

module.exports = { joinQueue, leaveQueue };
