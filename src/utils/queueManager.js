const db = require('../database/db');

function sortByPosition(players) {
  return [...players].sort((a, b) => a.position - b.position);
}

function renumber(data) {
  data.players = sortByPosition(data.players).map((player, index) => ({
    ...player,
    position: index + 1,
  }));
}

function getState() {
  return db.getData().state;
}

function setQueueOpen(isOpen, testerId = null, testerTag = null) {
  const data = db.getData();
  data.state.is_open = !!isOpen;
  data.state.active_tester_id = testerId;
  data.state.active_tester_tag = testerTag;
  db.setData(data);
}

function setQueueMessage(channelId, messageId) {
  const data = db.getData();
  data.state.queue_channel_id = channelId;
  data.state.queue_message_id = messageId;
  db.setData(data);
}

function setLastSessionEnded(timestampMs) {
  const data = db.getData();
  data.state.last_session_ended_at = timestampMs;
  db.setData(data);
}

function getAllPlayers() {
  return sortByPosition(db.getData().players);
}

function getPlayerCount() {
  return db.getData().players.length;
}

function isInQueue(discordId) {
  return db.getData().players.some((p) => p.discord_id === discordId);
}

function addPlayer(discordId, username, tag) {
  const data = db.getData();
  const position = data.players.length + 1;
  data.players.push({
    discord_id: discordId,
    username,
    tag,
    joined_at: Date.now(),
    position,
  });
  db.setData(data);
}

function removePlayer(discordId) {
  const data = db.getData();
  data.players = data.players.filter((p) => p.discord_id !== discordId);
  renumber(data);
  db.setData(data);
}

function popNextPlayer() {
  const data = db.getData();
  const ordered = sortByPosition(data.players);
  const player = ordered[0] || null;
  if (player) {
    data.players = data.players.filter((p) => p.discord_id !== player.discord_id);
    renumber(data);
    db.setData(data);
  }
  return player;
}

function clearQueue() {
  const data = db.getData();
  data.players = [];
  db.setData(data);
}

function reorderPositions() {
  const data = db.getData();
  renumber(data);
  db.setData(data);
}

function getPosition(discordId) {
  const player = db.getData().players.find((p) => p.discord_id === discordId);
  return player ? player.position : null;
}

function setPullChannel(channelId, playerId, testerId) {
  const data = db.getData();
  data.state.active_pull_channel_id = channelId;
  data.state.active_pull_player_id = playerId;
  data.state.active_pull_tester_id = testerId;
  db.setData(data);
}

function clearPullChannel() {
  const data = db.getData();
  data.state.active_pull_channel_id = null;
  data.state.active_pull_player_id = null;
  data.state.active_pull_tester_id = null;
  db.setData(data);
}

function isCapacityLocked() {
  return !!getState().capacity_locked;
}

function lockCapacity() {
  const data = db.getData();
  data.state.capacity_locked = true;
  db.setData(data);
}

function unlockCapacity() {
  const data = db.getData();
  data.state.capacity_locked = false;
  db.setData(data);
}

module.exports = {
  getState,
  setQueueOpen,
  setQueueMessage,
  setLastSessionEnded,
  getAllPlayers,
  getPlayerCount,
  isInQueue,
  addPlayer,
  removePlayer,
  popNextPlayer,
  clearQueue,
  reorderPositions,
  getPosition,
  setPullChannel,
  clearPullChannel,
  isCapacityLocked,
  lockCapacity,
  unlockCapacity,
};
