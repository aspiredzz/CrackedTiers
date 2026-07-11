const { SlashCommandBuilder } = require('discord.js');
const config = require('../config/config');
const runtimeConfig = require('../utils/runtimeConfig');
const queueManager = require('../utils/queueManager');
const roleManager = require('../utils/roleManager');
const channelManager = require('../utils/channelManager');
const queueDisplay = require('../utils/queueDisplay');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeplayer')
    .setDescription('Remove a player from the queue (Staff only)')
    .addUserOption((option) =>
      option.setName('player').setDescription('The player to remove').setRequired(true)
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('player');

    if (!queueManager.isInQueue(target.id)) {
      return interaction.reply({
        content: `⚠️ <@${target.id}> is not currently in the queue.`,
        ephemeral: true,
      });
    }

    queueManager.removePlayer(target.id);

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member) {
      await roleManager.removeWaitlistRole(member, runtimeConfig.getWaitlistRoleId());
      await channelManager.revokePrivateAccess(interaction.guild, member, runtimeConfig.getPrivateQueueChannelId());
    }

    await queueDisplay.refreshAll(interaction.client);

    await interaction.reply({
      content: `✅ Removed <@${target.id}> from the queue.`,
      ephemeral: true,
    });
  },
};
