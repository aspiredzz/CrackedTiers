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
