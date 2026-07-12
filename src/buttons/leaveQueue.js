const { leaveQueue } = require('../utils/queueActions');

module.exports = {
  customId: 'leave_queue',
  execute: leaveQueue,
};
