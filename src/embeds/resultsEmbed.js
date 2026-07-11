// ============================================================
// CDTIERS Bot - Test Results Embed
// Posted by /results in the configured results channel.
// ============================================================

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

function buildResultsEmbed({ username, tier, tester, previousRank, region, icon, gamemodeLabel }) {
  const titlePrefix = icon ? `${icon} ` : '🏆 ';

  return new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle(`${titlePrefix}${username}'s ${gamemodeLabel} Test Results`)
    .addFields(
      { name: 'Tester', value: `${tester}`, inline: false },
      { name: 'Region', value: `${region}`, inline: false },
      { name: 'Username', value: `${username}`, inline: false },
      { name: 'Previous Rank', value: `${previousRank}`, inline: false },
      { name: 'Rank Earned', value: `${tier}`, inline: false }
    )
    // Half-body (bust) render instead of just the head/face.
    .setThumbnail(`https://visage.surgeplay.com/bust/256/${encodeURIComponent(username)}.png`)
    .setFooter({ text: config.brand })
    .setTimestamp();
}

module.exports = { buildResultsEmbed };
