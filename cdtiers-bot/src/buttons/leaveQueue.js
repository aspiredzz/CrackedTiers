// ============================================================
// CDTIERS Bot - "Leave Queue" Button
// customId: leave_queue
// ============================================================

const { leaveQueue } = require('../utils/queueActions');

module.exports = {
  customId: 'leave_queue',
  execute: leaveQueue,
};
