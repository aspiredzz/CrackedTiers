const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

function buildResultsEmbed(data) {
  const {
    username,
    tester,
    gamemode,
    region,
    previousRank,
    tier,
  } = data;

  return new EmbedBuilder()
    .setColor(0xED4245)
    .setTitle(`🏆 ${username}'s Test Results`)
    .setThumbnail(`https://mc-heads.net/avatar/${encodeURIComponent(username)}/128`)
    .addFields(
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
        name: '👤 Username',
        value: username,
        inline: true,
      },
      {
        name: '📈 Previous Rank',
        value: previousRank,
        inline: true,
      },
      {
        name: '🥇 Rank Earned',
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
