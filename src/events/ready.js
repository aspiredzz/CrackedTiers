// ============================================================
// CDTIERS Bot - ready event
// Fires once when the bot successfully logs in. Restores the
// correct queue/no-tester display based on persisted state.
// ============================================================

const { ActivityType } = require('discord.js');
const config = require('../config/config');
const queueManager = require('../utils/queueManager');
const queueDisplay = require('../utils/queueDisplay');
const { logger } = require('../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);

    client.user.setPresence({
      activities: [{ name: config.botStatus, type: ActivityType.Watching }],
      status: 'online',
    });

    const state = queueManager.getState();
    if (state.is_open) {
      await queueDisplay.refreshAll(client);
    } else {
      await queueDisplay.showNoTester(client);
    }
  },
};
