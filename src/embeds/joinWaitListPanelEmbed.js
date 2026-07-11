// ============================================================
// CDTIERS Bot - Join Waitlist Panel Embed
// The static entry panel posted by /setjoinwaitlistchannel.
// Players click "Enter Waitlist" to join the queue - this reuses
// the same join_queue button handler as the live queue embed.
// ============================================================

const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');

function buildJoinWaitlistPanelEmbed() {
  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('📝 Evaluation Testing Waitlist')
    .setDescription(
      [
        'Click **Enter Waitlist** below to join the CDTIERS testing queue.',
        '',
        'Once you join, you will automatically get access to the private queue channel,',
        'where you will be pinged when a tester is ready for you.',
        '',
        '• Make sure the account you want tested is the one you are logged in as on Discord.',
        '• Be ready to join a call/report to the tester promptly once it is your turn.',
        '',
        '❗ Leaving mid-test or providing false information may result in a denied test.',
      ].join('\n')
    )
    .setFooter({ text: config.brand })
    .setTimestamp();
}

module.exports = { buildJoinWaitlistPanelEmbed };
