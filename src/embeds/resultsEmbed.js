const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

function buildResultsEmbed({
  username,
  tier,
  tester,
  previousRank,
  region,
  gamemode,
}) {
  return new EmbedBuilder()
    .setColor(config.colors.success)
    .setTitle(`🏆 ${username}'s Test Results`)
    .setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(username)}/128`)
    .addFields(
      {
        name: '👤 Username',
        value: username,
        inline: true,
      },
      {
        name: '🧪 Tester',
        value: tester,
        inline: true,
      },
      {
        name: '🎮 Gamemode',
        value: gamemode,
        inline: true,
      },
      {
        name: '🌍 Region',
        value: region,
        inline: true,
      },
      {
        name: '📈 Previous Rank',
        value: previousRank,
        inline: true,
      },
      {
        name: '🏆 Rank Earned',
        value: tier,
        inline: true,
      }
    )
    .setFooter({
      text: config.brand,
    })
    .setTimestamp();
}

module.exports = {
  buildResultsEmbed,
};