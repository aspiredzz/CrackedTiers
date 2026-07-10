const { SlashCommandBuilder } = require('discord.js');
const runtimeConfig = require('../utils/runtimeConfig');
const { buildResultsEmbed } = require('../embeds/resultsEmbed');
const { isStaff } = require('../utils/permissions');

const TIERS = [
  'HT1',
  'LT1',
  'HT2',
  'LT2',
  'HT3',
  'LT3',
  'HT4',
  'LT4',
  'HT5',
  'LT5',
  'Unranked'
];

const command = new SlashCommandBuilder()
  .setName('results')
  .setDescription('Submit a tier test result')
  .addStringOption(option =>
    option
      .setName('username')
      .setDescription('Minecraft Username')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('region')
      .setDescription('Player Region')
      .setRequired(true)
      .addChoices(
        { name: 'AS', value: 'AS' },
        { name: 'NA', value: 'NA' },
        { name: 'EU', value: 'EU' },
        { name: 'OCE', value: 'OCE' },
        { name: 'SA', value: 'SA' }
      )
  )
  .addStringOption(option =>
    option
      .setName('previousrank')
      .setDescription('Previous Rank')
      .setRequired(true)
  )
  .addStringOption(option => {
    option
      .setName('tier')
      .setDescription('Rank Earned')
      .setRequired(true);

    for (const rank of TIERS) {
      if (rank === 'Unranked') continue;

      option.addChoices({
        name: rank,
        value: rank,
      });
    }

    return option;
  });

module.exports = {
  data: command,

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const username = interaction.options.getString('username');
    const region = interaction.options.getString('region');
    const previousRank = interaction.options.getString('previousrank');
    const tier = interaction.options.getString('tier');

    const tester = interaction.user;

    const embed = buildResultsEmbed({
      username,
      tester: `<@${tester.id}>`,
      region,
      previousRank,
      tier,
    });

    try {
      const channelId = runtimeConfig.getResultsChannelId();

      if (!channelId) {
        return interaction.reply({
          content: '❌ Results channel has not been configured. Use `/setresultschannel` first.',
          ephemeral: true,
        });
      }

      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

      if (!channel || !channel.isTextBased()) {
        return interaction.reply({
          content: '❌ The configured results channel is invalid.',
          ephemeral: true,
        });
      }

      await channel.send({
        content: `**${username}**`,
        embeds: [embed],
      });

      await interaction.reply({
        content: '✅ Result posted successfully.',
        ephemeral: true,
      });

    } catch (error) {
      console.error(error);

      await interaction.reply({
        content: '❌ Failed to send the result.',
        ephemeral: true,
      });
    }
  },
};
