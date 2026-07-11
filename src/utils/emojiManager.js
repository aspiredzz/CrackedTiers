// ============================================================
// CDTIERS Bot - Gamemode Emoji Manager
// Uploads the CDTIERS gamemode icons as custom guild emojis (once,
// via /setupemojis) and remembers them so /results can prefix each
// result with the right icon: sword, SMP (pearl), UHC (heart),
// mace (hammer), pot (helmet), crystal (orb), axe.
// ============================================================

const fs = require('fs');
const path = require('path');
const runtimeConfig = require('./runtimeConfig');
const { logger } = require('./logger');

const ICONS_DIR = path.join(__dirname, '..', '..', 'assets', 'icons');

// The single source of truth for every supported gamemode: its display
// label, the local icon file, the custom emoji name to create, and a
// unicode fallback used automatically until /setupemojis has been run.
const GAME_MODES = [
  { key: 'sword', label: 'Sword', file: 'sword.png', emojiName: 'cdt_sword', fallback: '🗡️' },
  { key: 'smp', label: 'SMP', file: 'smp.png', emojiName: 'cdt_smp', fallback: '🔹' },
  { key: 'uhc', label: 'UHC', file: 'uhc.png', emojiName: 'cdt_uhc', fallback: '❤️' },
  { key: 'mace', label: 'Mace', file: 'mace.png', emojiName: 'cdt_mace', fallback: '🔨' },
  { key: 'pot', label: 'Pot', file: 'nethpot.png', emojiName: 'cdt_pot', fallback: '🪖' },
  { key: 'crystal', label: 'Crystal', file: 'crystal.png', emojiName: 'cdt_crystal', fallback: '🔮' },
  { key: 'axe', label: 'Axe', file: 'axe.png', emojiName: 'cdt_axe', fallback: '🪓' },
];

/**
 * Uploads every gamemode icon as a custom guild emoji (skipping any that
 * already exist by name) and persists the resulting <:name:id> mentions.
 * Returns a per-mode result list so the calling command can report back
 * exactly what succeeded/failed.
 */
async function setupGameModeEmojis(guild) {
  const results = [];

  for (const mode of GAME_MODES) {
    try {
      let emoji = guild.emojis.cache.find((e) => e.name === mode.emojiName);

      if (!emoji) {
        const filePath = path.join(ICONS_DIR, mode.file);
        if (!fs.existsSync(filePath)) {
          logger.warn(`Icon file missing for ${mode.key}: ${filePath}`);
          results.push({ ...mode, success: false, error: 'Icon file missing from project.' });
          continue;
        }
        emoji = await guild.emojis.create({ attachment: filePath, name: mode.emojiName });
      }

      const mention = `<:${emoji.name}:${emoji.id}>`;
      runtimeConfig.setGameModeEmoji(mode.key, mention);
      results.push({ ...mode, success: true, mention });
    } catch (err) {
      logger.error(`Failed to create emoji for ${mode.key}: ${err.message}`);
      results.push({ ...mode, success: false, error: err.message });
    }
  }

  return results;
}

/** Returns the emoji mention to use for a gamemode - the custom one if set up, otherwise a unicode fallback. */
function getGameModeEmoji(modeKey) {
  const stored = runtimeConfig.getGameModeEmoji(modeKey);
  if (stored) return stored;
  const mode = GAME_MODES.find((m) => m.key === modeKey);
  return mode ? mode.fallback : '';
}

/** Returns the human-readable label for a gamemode key (e.g. 'pot' -> 'Pot'). */
function getGameModeLabel(modeKey) {
  const mode = GAME_MODES.find((m) => m.key === modeKey);
  return mode ? mode.label : modeKey;
}

module.exports = { GAME_MODES, setupGameModeEmojis, getGameModeEmoji, getGameModeLabel };
