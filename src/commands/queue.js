const { SlashCommandBuilder } = require('discord.js');
const queueManager = require('../utils/queueManager');
const queueDisplay = require('../utils/queueDisplay');
const runtimeConfig = require('../utils/runtimeConfig');
const { GAME_MODES, getGameModeLabel } = require('../utils/emojiManager');
const { isStaff } = require('../utils/permissions');
const { logger } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Open a queue for a specific gamemode (Staff only)')
    .addStringOption((option) =>
      option
        .setName('gamemode')
        .setDescription('Gamemode to test')
        .setRequired(true)
        .addChoices(...GAME_MODES.map((mode) => ({ name: mode.label, value: mode.key })))
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const queueChannelId = runtimeConfig.getQueueChannelId();
    if (!queueChannelId) {
      return interaction.reply({
        content: '❌ No queue channel is set yet. Run `/setqueuechannel` first, then try again.',
        ephemeral: true,
      });
    }

    const state = queueManager.getState();
    if (state.is_open) {
      return interaction.reply({
        content: `⚠️ A queue is already open (started by <@${state.active_tester_id}>). Have them run \`/close\` first.`,
        ephemeral: true,
      });
    }

    const gamemodeKey = interaction.options.getString('gamemode');

    queueManager.setQueueOpen(true, interaction.user.id, interaction.user.tag);
    queueManager.setActiveGamemode(gamemodeKey);
    queueManager.unlockCapacity();
    await queueDisplay.refreshAll(interaction.client);

    try {
      const queueChannel = await interaction.client.channels.fetch(queueChannelId).catch(() => null);
      const roleId = runtimeConfig.getGameModeRole(gamemodeKey);

      if (queueChannel) {
        if (roleId) {
          await queueChannel.send({
            content: `<@&${roleId}> The **${getGameModeLabel(gamemodeKey)}** queue is now open! Use \`/requesttest\` or click **Enter Waitlist** to join.`,
            allowedMentions: { roles: [roleId] },
          });
        } else {
          await queueChannel.send({
            content: `The **${getGameModeLabel(gamemodeKey)}** queue is now open! Use \`/requesttest\` or click **Enter Waitlist** to join. *(No role set up for this gamemode yet - run \`/setrolechannel\` to enable pings.)*`,
          });
        }
      }
    } catch (err) {
      logger.error(`Failed to send gamemode queue-open ping: ${err.message}`);
    }

    await interaction.reply({
      content: `✅ Queue started for **${getGameModeLabel(gamemodeKey)}**! You are now the active tester.`,
      ephemeral: true,
    });
  },
};
