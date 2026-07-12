const { logger } = require('./logger');

async function grantPrivateAccess(guild, member, channelId) {
  if (!guild || !member || !channelId) {
    logger.warn('grantPrivateAccess called with missing guild/member/channelId - private queue channel is probably not set (/setprivatequeuechannel).');
    return false;
  }
  try {
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) {
      logger.error(`grantPrivateAccess: channel ${channelId} not found - it may have been deleted. Run /setprivatequeuechannel again.`);
      return false;
    }
    await channel.permissionOverwrites.edit(member.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });
    return true;
  } catch (err) {
    logger.error(`Failed to grant private queue access to ${member.id}: ${err.message} - the bot likely needs the "Manage Roles" permission in that channel.`);
    return false;
  }
}

async function revokePrivateAccess(guild, member, channelId) {
  if (!guild || !member || !channelId) return false;
  try {
    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return false;
    await channel.permissionOverwrites.delete(member.id);
    return true;
  } catch (err) {
    logger.error(`Failed to revoke private queue access for ${member.id}: ${err.message}`);
    return false;
  }
}

module.exports = { grantPrivateAccess, revokePrivateAccess };
