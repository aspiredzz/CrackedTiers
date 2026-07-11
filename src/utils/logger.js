// ============================================================
// CDTIERS Bot - Logger
// Lightweight timestamped console logger used across the project.
// ============================================================

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info(message) {
    console.log(`[${timestamp()}] [INFO] ${message}`);
  },
  warn(message) {
    console.warn(`[${timestamp()}] [WARN] ${message}`);
  },
  error(message) {
    console.error(`[${timestamp()}] [ERROR] ${message}`);
  },
  debug(message) {
    if (process.env.DEBUG === 'true') {
      console.log(`[${timestamp()}] [DEBUG] ${message}`);
    }
  },
};

module.exports = { logger };
