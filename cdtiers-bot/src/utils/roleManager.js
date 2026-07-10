// ============================================================
// CDTIERS Bot - Role Manager
// Keeps the WAITLIST/QUEUE role perfectly in sync with the queue.
// ============================================================

const { logger } = require('./logger');

/** Gives a member the WAITLIST/QUEUE role if they don't already have it. */
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

/** Removes the WAITLIST/QUEUE role from a member if they have it. */
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
