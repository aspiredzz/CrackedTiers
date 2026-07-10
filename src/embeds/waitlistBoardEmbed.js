// ============================================================
// CDTIERS Bot - Private Queue Board Embed
// This is the live board maintained inside the private queue
// channel. Every queued player can see the full waiting list here.
// ============================================================

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const queueManager = require('../utils/queueManager');

function buildBoardEmbed() {
  const state = queueManager.getState();
  const players = queueManager.getAllPlayers();

  const listText = players.length
    ? players.map((p, i) => `${i + 1}. ${p.username}`).join('\n')
    : 'No players waiting.';

  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('📋 Live Queue Board')
    .addFields(
      { name: 'Status', value: state.is_open ? '🟢 Open' : '🔴 Closed', inline: true },
      {
        name: 'Active Tester',
        value: state.active_tester_id ? `<@${state.active_tester_id}>` : 'None',
        inline: true,
      },
      { name: 'Capacity', value: `${players.length}/${config.maxQueueSize}`, inline: true },
      { name: 'Players Waiting', value: listText }
    )
    .setFooter({ text: config.brand })
    .setTimestamp();
}

module.exports = { buildBoardEmbed };
