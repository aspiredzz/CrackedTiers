// ============================================================
// CDTIERS Bot - Public Live Queue Embed
// Simple, single-block layout (title + one long description),
// matching the classic MCTiers-style "Tester(s) Available!" look
// instead of a busy multi-field embed.
// ============================================================

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const queueManager = require('../utils/queueManager');

function buildQueueEmbed() {
  const state = queueManager.getState();
  const players = queueManager.getAllPlayers();
  const capacity = config.maxQueueSize;

  const queueLines = players.length
    ? players.map((p, i) => `${i + 1}. <@${p.discord_id}>`).join('\n')
    : '*No players in queue.*';

  const testerLines = state.active_tester_id
    ? `1. <@${state.active_tester_id}>`
    : '*No active testers.*';

  const description = [
    'The queue updates automatically as players join and leave.',
    'Use **Enter Waitlist** below to join, or **Leave Queue** to leave.',
    '',
    `**Queue (${players.length}/${capacity}):**`,
    queueLines,
    '',
    '**Active Testers:**',
    testerLines,
  ].join('\n');

  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('🧑\u200d⚖️ Tester(s) Available!')
    .setDescription(description)
    .setFooter({ text: config.brand })
    .setTimestamp();
}

module.exports = { buildQueueEmbed };
