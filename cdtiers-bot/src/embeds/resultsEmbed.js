// ============================================================
// CDTIERS Bot - Test Results Embed
// Posted by /results in the configured results channel.
// ============================================================

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

function buildResultsEmbed({ username, tier, tester, previousRank, region }) {
  return new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle(`🏆 ${username}'s Test Results`)
    .addFields(
      { name: 'Tester', value: `${tester}`, inline: false },
      { name: 'Region', value: `${region}`, inline: false },
      { name: 'Username', value: `${username}`, inline: false },
      { name: 'Previous Rank', value: `${previousRank}`, inline: false },
      { name: 'Rank Earned', value: `${tier}`, inline: false }
    )
    .setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(username)}/128`)
    .setFooter({ text: config.brand })
    .setTimestamp();
}

module.exports = { buildResultsEmbed };
