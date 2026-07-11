// ============================================================
// CDTIERS Bot - /requesttest
// Anyone can use. Joins the caller to the testing queue.
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const { joinQueue } = require('../utils/queueActions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('requesttest')
    .setDescription('Join the CDTIERS testing queue'),

  async execute(interaction) {
    await joinQueue(interaction);
  },
};
