// ============================================================
// CDTIERS Bot - Queue Manager
// Pure data-layer helpers around the JSON file store. Nothing in
// this file talks to Discord directly - that keeps the queue
// logic testable and easy to reason about. The public function
// signatures are unchanged from before, so nothing else in the
// project needed to change when the storage backend switched
// from SQLite to a JSON file.
// ============================================================

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

/** Returns the current queue state (open/closed, active tester, message IDs, etc). */
function getState() {
  return db.getData().state;
}

/** Opens or closes the queue and records who the active tester is. */
function setQueueOpen(isOpen, testerId = null, testerTag = null) {
  const data = db.getData();
  data.state.is_open = !!isOpen;
  data.state.active_tester_id = testerId;
  data.state.active_tester_tag = testerTag;
  db.setData(data);
}

/** Records which message is currently being used as the public queue embed. */
function setQueueMessage(channelId, messageId) {
  const data = db.getData();
  data.state.queue_channel_id = channelId;
  data.state.queue_message_id = messageId;
  db.setData(data);
}

/** Records which message is currently being used as the private queue board. */
function setBoardMessage(channelId, messageId) {
  const data = db.getData();
  data.state.board_channel_id = channelId;
  data.state.board_message_id = messageId;
  db.setData(data);
}

/** Marks when the last testing session ended (used on the "No Testers Online" embed). */
function setLastSessionEnded(timestampMs) {
  const data = db.getData();
  data.state.last_session_ended_at = timestampMs;
  db.setData(data);
}

/** Returns every queued player, ordered by their position. */
function getAllPlayers() {
  return sortByPosition(db.getData().players);
}

/** Returns how many players are currently queued. */
function getPlayerCount() {
  return db.getData().players.length;
}

/** Returns true if the given user is already queued. */
function isInQueue(discordId) {
  return db.getData().players.some((p) => p.discord_id === discordId);
}

/** Adds a player to the back of the queue. */
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

/** Removes a specific player from the queue and reflows everyone else's position. */
function removePlayer(discordId) {
  const data = db.getData();
  data.players = data.players.filter((p) => p.discord_id !== discordId);
  renumber(data);
  db.setData(data);
}

/** Pops the player at the front of the queue (used by /nextplayer). */
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

/** Removes every player from the queue (used by /clearqueue and /stopqueue). */
function clearQueue() {
  const data = db.getData();
  data.players = [];
  db.setData(data);
}

/** Re-numbers positions 1..N so there are never any gaps. Exposed for completeness. */
function reorderPositions() {
  const data = db.getData();
  renumber(data);
  db.setData(data);
}

/** Returns a player's 1-indexed position, or null if they aren't queued. */
function getPosition(discordId) {
  const player = db.getData().players.find((p) => p.discord_id === discordId);
  return player ? player.position : null;
}

/** Records the private 1:1 testing channel created by /pull, so it can be cleaned up later. */
function setPullChannel(channelId, playerId, testerId) {
  const data = db.getData();
  data.state.active_pull_channel_id = channelId;
  data.state.active_pull_player_id = playerId;
  data.state.active_pull_tester_id = testerId;
  db.setData(data);
}

/** Clears the tracked pull channel (called after it's deleted). */
function clearPullChannel() {
  const data = db.getData();
  data.state.active_pull_channel_id = null;
  data.state.active_pull_player_id = null;
  data.state.active_pull_tester_id = null;
  db.setData(data);
}

module.exports = {
  getState,
  setQueueOpen,
  setQueueMessage,
  setBoardMessage,
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
};
