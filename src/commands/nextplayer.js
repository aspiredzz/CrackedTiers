// ============================================================
// CDTIERS Bot - /nextplayer
// Staff only. Pulls the next player from the front of the queue
// so the tester can begin their test.
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const config = require('../config/config');
const runtimeConfig = require('../utils/runtimeConfig');
const queueManager = require('../utils/queueManager');
const roleManager = require('../utils/roleManager');
const channelManager = require('../utils/channelManager');
const queueDisplay = require('../utils/queueDisplay');
const { closeActivePullChannel } = require('../utils/pullChannel');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nextplayer')
    .setDescription('Pull the next player from the queue (Staff only)'),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const state = queueManager.getState();
    if (!state.is_open) {
      return interaction.reply({ content: '⚠️ The queue is not currently open.', ephemeral: true });
    }

    const players = queueManager.getAllPlayers();
    if (players.length === 0) {
      return interaction.reply({ content: '⚠️ The queue is currently empty.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    // Moving on to the next player closes out the previous /pull testing channel, if any.
    await closeActivePullChannel(interaction.guild);

    const nextPlayer = players[0];

    try {
      const privateChannel = await interaction.guild.channels
        .fetch(runtimeConfig.getPrivateQueueChannelId())
        .catch(() => null);
      if (privateChannel) {
        await privateChannel.send({
          content: `▶️ <@${nextPlayer.discord_id}>, it's your turn! Please get ready to be tested by <@${interaction.user.id}>.`,
        });
      }
    } catch (err) {
      // Non-fatal - continue processing even if the announcement fails.
    }

    queueManager.popNextPlayer();

    const member = await interaction.guild.members.fetch(nextPlayer.discord_id).catch(() => null);
    if (member) {
      await roleManager.removeWaitlistRole(member, runtimeConfig.getWaitlistRoleId());
      await channelManager.revokePrivateAccess(interaction.guild, member, runtimeConfig.getPrivateQueueChannelId());
    }

    await queueDisplay.refreshAll(interaction.client);

    await interaction.editReply({
      content: `✅ Now testing <@${nextPlayer.discord_id}>.`,
    });
  },
};
