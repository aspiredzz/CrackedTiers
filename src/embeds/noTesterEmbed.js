// ============================================================
// CDTIERS Bot - "No Testers Online" Embed
// Shown in the public queue channel whenever the queue is closed.
// ============================================================

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const queueManager = require('../utils/queueManager');

function buildNoTesterEmbed() {
  const state = queueManager.getState();

  const embed = new EmbedBuilder()
    .setColor(config.colors.danger)
    .setTitle(`🧑\u200d⚖️ ${config.brand} | Minecraft Sword PvP Community`)
    .setDescription(
      [
        '**No Testers Online**',
        '',
        'No testers are available at this time.',
        'You will be pinged when a tester is available.',
        'Check back later!',
      ].join('\n')
    )
    .setFooter({ text: config.brand })
    .setTimestamp();

  if (state?.last_session_ended_at) {
    embed.addFields({
      name: '\u200b',
      value: `Last testing session: <t:${Math.floor(state.last_session_ended_at / 1000)}:f>`,
    });
  }

  return embed;
}

module.exports = { buildNoTesterEmbed };
