// ============================================================
// CDTIERS Bot - Database Layer
// Uses a simple JSON file on disk (no native dependencies, no
// SQLite) so the queue survives restarts. Writes are atomic
// (write to a temp file, then rename) to avoid corruption if the
// process is killed mid-write.
// ============================================================

const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

const dataDir = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dataFile = path.join(dataDir, 'cdtiers.json');

const defaultData = {
  // Runtime settings configured through slash commands
  settings: {
    queueChannelId: null,
    resultsChannelId: null,
    joinWaitlistChannelId: null,
    testerIds: [],
  },

  // Queue state
  state: {
    is_open: false,
    active_tester_id: null,
    active_tester_tag: null,
    queue_channel_id: null,
    queue_message_id: null,
    board_channel_id: null,
    board_message_id: null,
    last_session_ended_at: null,
  },

  // Queue members
  players: [],
};

function writeToDisk(data) {
  const tmpFile = `${dataFile}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpFile, dataFile);
}

function readFromDisk() {
  if (!fs.existsSync(dataFile)) {
    writeToDisk(defaultData);
    return JSON.parse(JSON.stringify(defaultData));
  }

  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      settings: {
        ...defaultData.settings,
        ...(parsed.settings || {}),
      },

      state: {
        ...defaultData.state,
        ...(parsed.state || {}),
      },

      players: Array.isArray(parsed.players)
        ? parsed.players
        : [],
    };
  } catch (err) {
    logger.error(
      `Failed to read data file, resetting to defaults: ${err.message}`
    );

    writeToDisk(defaultData);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

// In-memory cache
let cache = readFromDisk();

logger.info(`Database ready at ${dataFile}`);

function getData() {
  return cache;
}

function setData(data) {
  cache = data;
  writeToDisk(cache);
}

module.exports = {
  getData,
  setData,
};
