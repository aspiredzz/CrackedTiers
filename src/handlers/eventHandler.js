// ============================================================
// CDTIERS Bot - Event Handler
// Loads every file in src/events and binds it to the client.
// ============================================================

const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

function loadEvents(client) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const files = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

  for (const file of files) {
    try {
      const event = require(path.join(eventsPath, file));
      if (!event?.name || typeof event.execute !== 'function') {
        logger.warn(`Skipped invalid event file (bad shape): ${file}`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      logger.info(`Loaded event: ${event.name}`);
    } catch (err) {
      logger.error(`Failed to load event file "${file}": ${err.message}`);
    }
  }
}

module.exports = { loadEvents };
