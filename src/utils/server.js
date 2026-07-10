// ============================================================
// CDTIERS Bot - self pinger idk bro 
// Runs a tiny Express server with a GET /health endpoint so
// Railway (or any uptime monitor) can confirm the process is
// alive. Also self-pings its own public URL periodically to
// help keep the service warm - this runs independently and
// never interferes with the Discord client.
// ============================================================

const express = require('express');
const fetch = require('node-fetch');
const config = require('../config/config');
const { logger } = require('./logger');

const PING_INTERVAL_MS = 4 * 60 * 1000; // every 4 minutes

function startServer() {
  const app = express();

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      bot: config.brand,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/', (req, res) => {
    res.status(200).send(`${config.brand} bot is running.`);
  });

  app.listen(config.port, () => {
    logger.info(`Health server listening on port ${config.port}`);
  });

  startSelfPinger();
}

function startSelfPinger() {
  if (!config.railwayUrl) {
    logger.info('RAILWAY_STATIC_URL not set - self-pinger disabled.');
    return;
  }

  const target = `${config.railwayUrl.replace(/\/$/, '')}/health`;

  setInterval(async () => {
    try {
      const res = await fetch(target, { method: 'GET' });
      logger.debug(`Self-ping to ${target} returned status ${res.status}`);
    } catch (err) {
      logger.warn(`Self-ping failed: ${err.message}`);
    }
  }, PING_INTERVAL_MS);

  logger.info(`Self-pinger started - pinging ${target} every ${PING_INTERVAL_MS / 60000} minutes.`);
}

module.exports = { startServer };
