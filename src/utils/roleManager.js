const { logger } = require('./logger');

async function giveWaitlistRole(member, roleId) {
  if (!member || !roleId) return;
  try {
    if (!member.roles.cache.has(roleId)) {
      await member.roles.add(roleId);
    }
  } catch (err) {
    logger.error(`Failed to add waitlist role to ${member.id}: ${err.message}`);
  }
}

async function removeWaitlistRole(member, roleId) {
  if (!member || !roleId) return;
  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
    }
  } catch (err) {
    logger.error(`Failed to remove waitlist role from ${member.id}: ${err.message}`);
  }
}

module.exports = { giveWaitlistRole, removeWaitlistRole };
