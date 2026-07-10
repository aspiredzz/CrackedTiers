// ============================================================
// CDTIERS Bot - Permission Helpers
// ============================================================

const config = require('../config/config');
const runtimeConfig = require('./runtimeConfig');

/** Returns true if the member is a server admin, holds a configured staff role, or was added via /addtester. */
function isStaff(member) {
  if (!member) return false;
  if (member.permissions?.has('Administrator')) return true;
  if (config.staffRoleIds.some((roleId) => member.roles.cache.has(roleId))) return true;
  if (runtimeConfig.isTester(member.id)) return true;
  return false;
}

module.exports = { isStaff };
