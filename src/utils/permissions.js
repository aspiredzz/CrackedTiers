// ============================================================
// CDTIERS Bot - Permission Helpers
// ============================================================

const config = require('../config/config');

/** Returns true if the member is a server admin or holds a configured staff role. */
function isStaff(member) {
  if (!member) return false;
  if (member.permissions?.has('Administrator')) return true;
  return config.staffRoleIds.some((roleId) => member.roles.cache.has(roleId));
}

module.exports = { isStaff };
