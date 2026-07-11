// ============================================================
// CDTIERS Bot - Runtime Configuration
// Channel IDs and tester assignments set via slash commands
// (/setqueuechannel, /setresultchannel, /setjoinwaitlistchannel,
// /addtester). These are persisted to the JSON store and take
// priority over the .env values, so staff can configure or
// re-configure the bot entirely from inside Discord - no
// redeploy required.
// ============================================================

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

// ---- Private queue channel (still .env configured, exposed here for consistency) ----

function getPrivateQueueChannelId() {
  return config.privateQueueChannelId || null;
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

module.exports = {
  getQueueChannelId,
  setQueueChannelId,
  getResultsChannelId,
  setResultsChannelId,
  getJoinWaitlistChannelId,
  setJoinWaitlistChannelId,
  getPrivateQueueChannelId,
  getTesterIds,
  isTester,
  addTester,
  removeTester,
};
