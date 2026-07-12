const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dataFile = path.join(dataDir, 'cdtiers.json');

const defaultData = {
  state: {
    is_open: false,
    active_tester_id: null,
    active_tester_tag: null,
    active_gamemode: null,
    queue_channel_id: null,
    queue_message_id: null,
    last_session_ended_at: null,
    active_pull_channel_id: null,
    active_pull_player_id: null,
    active_pull_tester_id: null,
    // Once the queue fills up, this stays true for the rest of the session
    // even as players get pulled out - new players can't sneak into the
    // freed-up spots until the next /startqueue session.
    capacity_locked: false,
  },
  players: [],
  // Runtime-configurable settings (set via slash commands). These take
  // priority over the .env values, so staff can (re)configure channels
  // and testers without needing to redeploy.
  settings: {
    queueChannelId: null,
    resultsChannelId: null,
    joinWaitlistChannelId: null,
    testerIds: [],
    waitlistRoleId: null,
    privateQueueChannelId: null,
    gameModeEmojis: {},
    gameModeRoles: {},
    roleChannelId: null,
    roleMessageId: null,
  },
};

function readFromDisk() {
  if (!fs.existsSync(dataFile)) {
    writeToDisk(defaultData);
    return JSON.parse(JSON.stringify(defaultData));
  }
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);
    // Guard against a partially-shaped file (e.g. from an older version).
    return {
      state: { ...defaultData.state, ...(parsed.state || {}) },
      players: Array.isArray(parsed.players) ? parsed.players : [],
      settings: {
        ...defaultData.settings,
        ...(parsed.settings || {}),
        testerIds: Array.isArray(parsed.settings?.testerIds) ? parsed.settings.testerIds : [],
        gameModeEmojis:
          parsed.settings?.gameModeEmojis && typeof parsed.settings.gameModeEmojis === 'object'
            ? parsed.settings.gameModeEmojis
            : {},
        gameModeRoles:
          parsed.settings?.gameModeRoles && typeof parsed.settings.gameModeRoles === 'object'
            ? parsed.settings.gameModeRoles
            : {},
      },
    };
  } catch (err) {
    logger.error(`Failed to read data file, resetting to defaults: ${err.message}`);
    writeToDisk(defaultData);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function writeToDisk(data) {
  const tmpFile = `${dataFile}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpFile, dataFile);
}

// In-memory cache, kept in sync with disk on every mutation.
let cache = readFromDisk();

logger.info(`Database ready at ${dataFile}`);

function getData() {
  return cache;
}

function setData(data) {
  cache = data;
  writeToDisk(cache);
}

module.exports = { getData, setData };
