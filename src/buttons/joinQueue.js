const { joinQueue } = require('../utils/queueActions');

module.exports = {
  customId: 'join_queue',
  execute: joinQueue,
};
