const queueManager = require('./queueManager');
const { logger } = require('./logger');

async function closeActivePullChannel(guild) {
  const state = queueManager.getState();
  if (!state.active_pull_channel_id) return;

  try {
    const channel = await guild.channels.fetch(state.active_pull_channel_id).catch(() => null);
    if (channel) {
      await channel.delete('Closing previous CDTIERS pull/testing channel.');
    }
  } catch (err) {
    logger.error(`Failed to delete previous pull channel: ${err.message}`);
  } finally {
    queueManager.clearPullChannel();
  }
}

module.exports = { closeActivePullChannel };
