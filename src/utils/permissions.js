const { PermissionFlagsBits } = require('discord.js');
const config = require('../config/config');
const runtimeConfig = require('./runtimeConfig');

// Any member with one of these permissions is treated as staff - not just
// literal "Administrator". Plenty of servers give their staff/admin roles
// a bundle of management permissions (Manage Server, Manage Roles, etc.)
// without ever toggling the single "Administrator" switch, so checking
// only that bit locks real admins out. @everyone has none of these by
// default, so regular members still can't get in.
const STAFF_PERMISSIONS = [
  PermissionFlagsBits.Administrator,
  PermissionFlagsBits.ManageGuild,
  PermissionFlagsBits.ManageRoles,
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.KickMembers,
  PermissionFlagsBits.BanMembers,
  PermissionFlagsBits.ManageMessages,
];

function isStaff(member) {
  if (!member) return false;
  if (STAFF_PERMISSIONS.some((perm) => member.permissions?.has(perm))) return true;
  if (config.staffRoleIds.some((roleId) => member.roles.cache.has(roleId))) return true;
  if (runtimeConfig.isTester(member.id)) return true;
  return false;
}

module.exports = { isStaff };
