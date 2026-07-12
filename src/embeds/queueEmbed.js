const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const queueManager = require('../utils/queueManager');
const { getGameModeEmoji, getGameModeLabel } = require('../utils/emojiManager');

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

  const descriptionParts = [
    'The queue updates automatically as players join and leave.',
    'Use **Enter Waitlist** below to join, or **Leave Queue** to leave.',
    '',
  ];

  if (state.active_gamemode) {
    const icon = getGameModeEmoji(state.active_gamemode);
    const label = getGameModeLabel(state.active_gamemode);
    descriptionParts.push(`**Gamemode:** ${icon} ${label}`, '');
  }

  descriptionParts.push(
    `**Queue (${players.length}/${capacity}):**`,
    queueLines,
    '',
    '**Active Testers:**',
    testerLines
  );

  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('🧑\u200d⚖️ Tester(s) Available!')
    .setDescription(descriptionParts.join('\n'))
    .setFooter({ text: config.brand })
    .setTimestamp();
}

module.exports = { buildQueueEmbed };
