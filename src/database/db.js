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
  players: [],
  // Runtime-configurable settings (set via slash commands). These take
  // priority over the .env values, so staff can (re)configure channels
  // and testers without needing to redeploy.
  settings: {
    queueChannelId: null,
    resultsChannelId: null,
    joinWaitlistChannelId: null,
    testerIds: [],
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

/** Returns the live in-memory data object (state + players). Mutate it, then call setData. */
function getData() {
  return cache;
}

/** Persists the given data object to disk and updates the in-memory cache. */
function setData(data) {
  cache = data;
  writeToDisk(cache);
}

module.exports = { getData, setData };
