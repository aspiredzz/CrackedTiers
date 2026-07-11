// ============================================================
// CDTIERS Bot - /pull
// Staff only. Pulls a player (either specified, or the next one
// in line) out of the queue and creates a brand new private
// channel visible only to that player and the tester who ran the
// command, so they can talk 1:1 during the test. The previous
// pull channel (if any) is automatically deleted first - either
// when /pull is run again, or when /nextplayer is run.
// ============================================================

const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const queueManager = require('../utils/queueManager');
const runtimeConfig = require('../utils/runtimeConfig');
const roleManager = require('../utils/roleManager');
const channelManager = require('../utils/channelManager');
const queueDisplay = require('../utils/queueDisplay');
const { closeActivePullChannel } = require('../utils/pullChannel');
const { isStaff } = require('../utils/permissions');
const { logger } = require('../utils/logger');

function sanitizeChannelName(name) {
  const cleaned = (name || 'player')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned.slice(0, 80) || 'player';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pull')
    .setDescription('Pull a player into a private 1:1 testing channel with you (Staff only)')
    .addUserOption((option) =>
      option
        .setName('player')
        .setDescription('Specific player to pull (defaults to the next one in the queue)')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // Close out whatever channel was created for the last pull before starting a new one.
    await closeActivePullChannel(interaction.guild);

    const specifiedUser = interaction.options.getUser('player');
    let targetPlayer;

    if (specifiedUser) {
      if (!queueManager.isInQueue(specifiedUser.id)) {
        return interaction.editReply({
          content: `⚠️ <@${specifiedUser.id}> is not currently in the queue.`,
        });
      }
      targetPlayer = { discord_id: specifiedUser.id, username: specifiedUser.username };
      queueManager.removePlayer(specifiedUser.id);
    } else {
      const popped = queueManager.popNextPlayer();
      if (!popped) {
        return interaction.editReply({ content: '⚠️ The queue is currently empty.' });
      }
      targetPlayer = popped;
    }

    // The pulled player is done waiting - drop their waitlist role/access same as /nextplayer.
    const member = await interaction.guild.members.fetch(targetPlayer.discord_id).catch(() => null);
    if (member) {
      await roleManager.removeWaitlistRole(member, runtimeConfig.getWaitlistRoleId());
      await channelManager.revokePrivateAccess(
        interaction.guild,
        member,
        runtimeConfig.getPrivateQueueChannelId()
      );
    }

    // Create the new channel in the same category as the private queue channel, if possible.
    let parentId;
    const privateQueueChannelId = runtimeConfig.getPrivateQueueChannelId();
    if (privateQueueChannelId) {
      const parentChannel = await interaction.guild.channels.fetch(privateQueueChannelId).catch(() => null);
      parentId = parentChannel?.parentId || undefined;
    }

    let testChannel;
    try {
      testChannel = await interaction.guild.channels.create({
        name: `test-${sanitizeChannelName(targetPlayer.username)}`,
        type: ChannelType.GuildText,
        parent: parentId,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: targetPlayer.discord_id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
        ],
      });
    } catch (err) {
      logger.error(`Failed to create pull channel: ${err.message}`);
      return interaction.editReply({
        content: '❌ Failed to create the private testing channel. Check that I have the "Manage Channels" permission.',
      });
    }

    queueManager.setPullChannel(testChannel.id, targetPlayer.discord_id, interaction.user.id);

    await testChannel.send({
      content: `👋 <@${targetPlayer.discord_id}>, you've been pulled for testing by <@${interaction.user.id}>! This channel is just for the two of you - get ready to begin.`,
    });

    await queueDisplay.refreshAll(interaction.client);

    await interaction.editReply({
      content: `✅ Pulled <@${targetPlayer.discord_id}> into ${testChannel}.`,
    });
  },
};
