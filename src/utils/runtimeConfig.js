const db = require('../database/db');
const config = require('../config/config');

function getSettings() {
  return db.getData().settings;
}

// ---- Public queue channel ----

function getQueueChannelId() {
  return getSettings().queueChannelId || config.queueChannelId || null;
}

function setQueueChannelId(channelId) {
  const data = db.getData();
  data.settings.queueChannelId = channelId;
  db.setData(data);
}

// ---- Results channel ----

function getResultsChannelId() {
  return getSettings().resultsChannelId || config.resultsChannelId || null;
}

function setResultsChannelId(channelId) {
  const data = db.getData();
  data.settings.resultsChannelId = channelId;
  db.setData(data);
}

// ---- Join-waitlist panel channel ----

function getJoinWaitlistChannelId() {
  return getSettings().joinWaitlistChannelId || null;
}

function setJoinWaitlistChannelId(channelId) {
  const data = db.getData();
  data.settings.joinWaitlistChannelId = channelId;
  db.setData(data);
}

// ---- Private queue channel ----
// Can now be overridden at runtime via /setprivatequeuechannel, falls back
// to the .env value if never set from Discord.

function getPrivateQueueChannelId() {
  return getSettings().privateQueueChannelId || config.privateQueueChannelId || null;
}

function setPrivateQueueChannelId(channelId) {
  const data = db.getData();
  data.settings.privateQueueChannelId = channelId;
  db.setData(data);
}

// ---- WAITLIST/QUEUE role ----
// Can now be overridden at runtime via /setwaitlistrole, falls back to the
// .env value if never set from Discord.

function getWaitlistRoleId() {
  return getSettings().waitlistRoleId || config.waitlistRoleId || null;
}

function setWaitlistRoleId(roleId) {
  const data = db.getData();
  data.settings.waitlistRoleId = roleId;
  db.setData(data);
}

// ---- Testers (staff granted dynamically via /addtester) ----

function getTesterIds() {
  return getSettings().testerIds;
}

function isTester(userId) {
  return getSettings().testerIds.includes(userId);
}

function addTester(userId) {
  const data = db.getData();
  if (!data.settings.testerIds.includes(userId)) {
    data.settings.testerIds.push(userId);
    db.setData(data);
  }
}

function removeTester(userId) {
  const data = db.getData();
  data.settings.testerIds = data.settings.testerIds.filter((id) => id !== userId);
  db.setData(data);
}

// ---- Gamemode result icons (custom emojis set up via /setupemojis) ----

function getGameModeEmoji(modeKey) {
  return getSettings().gameModeEmojis?.[modeKey] || null;
}

function setGameModeEmoji(modeKey, emojiMention) {
  const data = db.getData();
  if (!data.settings.gameModeEmojis) {
    data.settings.gameModeEmojis = {};
  }
  data.settings.gameModeEmojis[modeKey] = emojiMention;
  db.setData(data);
}

// ---- Gamemode roles (created/tracked via /setrolechannel, pinged by /queue) ----

function getGameModeRole(modeKey) {
  return getSettings().gameModeRoles?.[modeKey] || null;
}

function setGameModeRole(modeKey, roleId) {
  const data = db.getData();
  if (!data.settings.gameModeRoles) {
    data.settings.gameModeRoles = {};
  }
  data.settings.gameModeRoles[modeKey] = roleId;
  db.setData(data);
}

// ---- Role-select panel location (so reaction events know which message to watch) ----

function getRolePanel() {
  return {
    channelId: getSettings().roleChannelId || null,
    messageId: getSettings().roleMessageId || null,
  };
}

function setRolePanel(channelId, messageId) {
  const data = db.getData();
  data.settings.roleChannelId = channelId;
  data.settings.roleMessageId = messageId;
  db.setData(data);
}

module.exports = {
  getQueueChannelId,
  setQueueChannelId,
  getResultsChannelId,
  setResultsChannelId,
  getJoinWaitlistChannelId,
  setJoinWaitlistChannelId,
  getPrivateQueueChannelId,
  setPrivateQueueChannelId,
  getWaitlistRoleId,
  setWaitlistRoleId,
  getTesterIds,
  isTester,
  addTester,
  removeTester,
  getGameModeEmoji,
  setGameModeEmoji,
  getGameModeRole,
  setGameModeRole,
  getRolePanel,
  setRolePanel,
};
