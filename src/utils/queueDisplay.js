const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config/config');
const runtimeConfig = require('./runtimeConfig');
const queueManager = require('./queueManager');
const { buildNoTesterEmbed } = require('../embeds/noTesterEmbed');
const { buildQueueEmbed } = require('../embeds/queueEmbed');
const { logger } = require('./logger');

function getQueueButtons(disableJoin = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('join_queue')
      .setLabel('Enter Waitlist')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disableJoin),
    new ButtonBuilder()
      .setCustomId('leave_queue')
      .setLabel('Leave Queue')
      .setStyle(ButtonStyle.Secondary)
  );
}

async function getQueueChannel(client) {
  const channelId = runtimeConfig.getQueueChannelId();
  if (!channelId) return null;
  return client.channels.fetch(channelId).catch(() => null);
}

async function showNoTester(client) {
  const channel = await getQueueChannel(client);
  if (!channel) return;

  const embed = buildNoTesterEmbed();
  const state = queueManager.getState();

  try {
    if (state.queue_message_id) {
      const existing = await channel.messages.fetch(state.queue_message_id).catch(() => null);
      if (existing) {
        await existing.edit({ embeds: [embed], components: [] });
        return;
      }
    }
    const sent = await channel.send({ embeds: [embed] });
    queueManager.setQueueMessage(channel.id, sent.id);
  } catch (err) {
    logger.error(`Failed to show no-tester embed: ${err.message}`);
  }
}

async function refreshQueueEmbed(client) {
  const state = queueManager.getState();
  if (!state.is_open) {
    return showNoTester(client);
  }

  const channel = await getQueueChannel(client);
  if (!channel) return;

  const embed = buildQueueEmbed();
  const isFull = queueManager.getPlayerCount() >= config.maxQueueSize;

  try {
    if (state.queue_message_id) {
      const existing = await channel.messages.fetch(state.queue_message_id).catch(() => null);
      if (existing) {
        await existing.edit({ embeds: [embed], components: [getQueueButtons(isFull)] });
        return;
      }
    }
    const sent = await channel.send({ embeds: [embed], components: [getQueueButtons(isFull)] });
    queueManager.setQueueMessage(channel.id, sent.id);
  } catch (err) {
    logger.error(`Failed to refresh queue embed: ${err.message}`);
  }
}

async function refreshAll(client) {
  await refreshQueueEmbed(client);
}

module.exports = {
  showNoTester,
  refreshQueueEmbed,
  refreshAll,
  getQueueButtons,
};
