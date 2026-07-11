// ============================================================
// CDTIERS Bot - "Enter Waitlist" Button
// customId: join_queue
// ============================================================

const { joinQueue } = require('../utils/queueActions');

module.exports = {
  customId: 'join_queue',
  execute: joinQueue,
};
