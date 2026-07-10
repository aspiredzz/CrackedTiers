// ============================================================
// CDTIERS Bot - Public "Evaluation Testing Waitlist" Embed
// This is the live queue embed shown in the public queue channel
// while the queue is open.
// ============================================================

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const queueManager = require('../utils/queueManager');

function buildQueueEmbed() {
  const state = queueManager.getState();
  const players = queueManager.getAllPlayers();
  const capacity = config.maxQueueSize;

  const listText = players.length
    ? players.map((p, i) => `**${i + 1}.** <@${p.discord_id}>`).join('\n')
    : '*No players in queue.*';

  const embed = new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('📝 Evaluation Testing Waitlist')
    .setDescription(
      [
        'Use `/requesttest` or the button below to join the queue.',
        'Once a tester is ready for you, you will be pinged in your private queue channel.',
      ].join('\n')
    )
    .addFields(
      { name: '🟢 Queue Status', value: state.is_open ? 'Open' : 'Closed', inline: true },
      { name: '📊 Queue Capacity', value: `${players.length}/${capacity}`, inline: true },
      {
        name: '🧑\u200d⚖️ Active Tester',
        value: state.active_tester_id ? `<@${state.active_tester_id}>` : 'None',
        inline: true,
      },
      { name: '📋 Current Queue', value: listText },
      { name: '⏳ Number Waiting', value: `${players.length}`, inline: true }
    )
    .setFooter({ text: config.brand })
    .setTimestamp();

  return embed;
}

module.exports = { buildQueueEmbed };
