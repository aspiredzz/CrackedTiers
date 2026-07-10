// ============================================================
// CDTIERS Bot - Central Configuration
// Reads every configurable value from environment variables so
// the bot never needs code changes to be reconfigured.
// ============================================================

require('dotenv').config();

function parseIdList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

const config = {
  brand: 'CDTIERS',

  // Discord credentials
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,

  // Channels
  queueChannelId: process.env.QUEUE_CHANNEL_ID,
  privateQueueChannelId: process.env.PRIVATE_QUEUE_CHANNEL_ID,
  resultsChannelId: process.env.RESULTS_CHANNEL_ID,

  // Roles
  staffRoleIds: parseIdList(process.env.STAFF_ROLE_IDS),
  waitlistRoleId: process.env.WAITLIST_ROLE_ID,

  // Queue behavior
  maxQueueSize: parseInt(process.env.MAX_QUEUE_SIZE || '20', 10),

  // Embed colors (decimal)
  colors: {
    primary: parseInt(process.env.EMBED_COLOR || '5793266', 10),
    success: parseInt(process.env.EMBED_COLOR_SUCCESS || '3066993', 10),
    danger: parseInt(process.env.EMBED_COLOR_DANGER || '15158332', 10),
  },

  // Presence
  botStatus: process.env.BOT_STATUS || 'Testing queue | /requesttest',

  // Web server / self-ping (Railway)
  railwayUrl: process.env.RAILWAY_STATIC_URL || null,
  port: parseInt(process.env.PORT || '3000', 10),
};

module.exports = config;
