const { logger } = require('./logger');

async function grantPrivateAccess(guild, member, channelId) {
  if (!guild || !member || !channelId) return;
  try {
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;
    await channel.permissionOverwrites.edit(member.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });
  } catch (err) {
    logger.error(`Failed to grant private queue access to ${member.id}: ${err.message}`);
  }
}

async function revokePrivateAccess(guild, member, channelId) {
  if (!guild || !member || !channelId) return;
  try {
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;
    await channel.permissionOverwrites.delete(member.id);
  } catch (err) {
    logger.error(`Failed to revoke private queue access for ${member.id}: ${err.message}`);
  }
}

module.exports = { grantPrivateAccess, revokePrivateAccess };
