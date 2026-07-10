// ============================================================
// CDTIERS Bot - /results
// Staff only. Posts a polished test results embed to the
// configured results channel.
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const runtimeConfig = require('../utils/runtimeConfig');
const { buildResultsEmbed } = require('../embeds/resultsEmbed');
const { isStaff } = require('../utils/permissions');
const { logger } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('results')
    .setDescription('Post a test result (Staff only)')
    .addStringOption((option) =>
      option.setName('username').setDescription('Minecraft username tested').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('tier').setDescription('Rank/tier earned').setRequired(true)
    )
    .addUserOption((option) =>
      option.setName('tester').setDescription('The staff member who ran the test').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('previousrank').setDescription('Previous rank before this test').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('region').setDescription('Region tested on (e.g. NA, EU, AS)').setRequired(true)
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const username = interaction.options.getString('username');
    const tier = interaction.options.getString('tier');
    const testerUser = interaction.options.getUser('tester');
    const previousRank = interaction.options.getString('previousrank');
    const region = interaction.options.getString('region');

    const embed = buildResultsEmbed({
      username,
      tier,
      tester: `<@${testerUser.id}>`,
      previousRank,
      region,
    });

    try {
      const resultsChannelId = runtimeConfig.getResultsChannelId();

      if (!resultsChannelId) {
        return interaction.reply({
          content: '❌ No results channel is set. Ask staff to run `/setresultchannel` first.',
          ephemeral: true,
        });
      }

      const resultsChannel = await interaction.guild.channels.fetch(resultsChannelId).catch(() => null);

      if (!resultsChannel) {
        return interaction.reply({
          content: '❌ The configured results channel could not be found. Run `/setresultchannel` again.',
          ephemeral: true,
        });
      }

      await resultsChannel.send({ content: `@${username}`, embeds: [embed] });
      await interaction.reply({ content: '✅ Result posted.', ephemeral: true });
    } catch (err) {
      logger.error(`Failed to post results: ${err.message}`);
      await interaction.reply({
        content: '❌ Something went wrong while posting the result.',
        ephemeral: true,
      });
    }
  },
};
