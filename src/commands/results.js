const { SlashCommandBuilder } = require('discord.js');
const runtimeConfig = require('../utils/runtimeConfig');
const { buildResultsEmbed } = require('../embeds/resultsEmbed');
const { isStaff } = require('../utils/permissions');
const { logger } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('results')
    .setDescription('Post a test result.')

    .addStringOption(option =>
      option
        .setName('username')
        .setDescription('Minecraft username')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('tier')
        .setDescription('Rank earned')
        .setRequired(true)
    )

    .addUserOption(option =>
      option
        .setName('tester')
        .setDescription('Tester')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('previousrank')
        .setDescription('Previous rank')
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName('region')
        .setDescription('Region')
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
        .setName('gamemode')
        .setDescription('Gamemode tested')
        .setRequired(true)
        .addChoices(
          { name: 'Sword', value: 'Sword' },
          { name: 'Vanilla', value: 'Vanilla' },
          { name: 'Diapot', value: 'Diapot' },
          { name: 'NethPot', value: 'NethPot' },
          { name: 'SMP', value: 'SMP' },
          { name: 'DiaSMP', value: 'DiaSMP' },
          { name: 'Cart', value: 'Cart' },
          { name: 'Axe', value: 'Axe' },
          { name: 'UHC', value: 'UHC' },
          { name: 'Mace', value: 'Mace' }
        )
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
    const tester = interaction.options.getUser('tester');
    const previousRank = interaction.options.getString('previousrank');
    const region = interaction.options.getString('region');
    const gamemode = interaction.options.getString('gamemode');

    const embed = buildResultsEmbed({
      username,
      tier,
      tester: `<@${tester.id}>`,
      previousRank,
      region,
      gamemode,
    });

    try {
      const channelId = runtimeConfig.getResultsChannelId();

      if (!channelId) {
        return interaction.reply({
          content: '❌ Results channel has not been configured.',
          ephemeral: true,
        });
      }

      const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

      if (!channel || !channel.isTextBased()) {
        return interaction.reply({
          content: '❌ Invalid results channel. Run `/setresultschannel` again.',
          ephemeral: true,
        });
      }

      await channel.send({
        content: `**${username}**`,
        embeds: [embed],
      });

      await interaction.reply({
        content: '✅ Results posted successfully.',
        ephemeral: true,
      });
    } catch (err) {
      logger.error(err);

      await interaction.reply({
        content: '❌ Failed to post results.',
        ephemeral: true,
      });
    }
  },
};
