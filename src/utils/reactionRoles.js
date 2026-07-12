const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const runtimeConfig = require('./runtimeConfig');
const { GAME_MODES, getGameModeEmoji, getGameModeEmojiId } = require('./emojiManager');
const { logger } = require('./logger');

async function ensureGameModeRoles(guild) {
  const results = [];

  for (const mode of GAME_MODES) {
    try {
      let roleId = runtimeConfig.getGameModeRole(mode.key);
      let role = roleId ? guild.roles.cache.get(roleId) : null;

      if (!role) {
        role = guild.roles.cache.find((r) => r.name === mode.label);
      }

      if (!role) {
        role = await guild.roles.create({
          name: mode.label,
          mentionable: true,
          reason: 'CDTIERS gamemode role',
        });
      }

      runtimeConfig.setGameModeRole(mode.key, role.id);
      results.push({ ...mode, success: true, roleId: role.id });
    } catch (err) {
      logger.error(`Failed to create/find role for ${mode.key}: ${err.message}`);
      results.push({ ...mode, success: false, error: err.message });
    }
  }

  return results;
}

function buildRolePanelEmbed() {
  const lines = GAME_MODES.map((mode) => {
    const emoji = getGameModeEmoji(mode.key);
    const roleId = runtimeConfig.getGameModeRole(mode.key);
    const roleMention = roleId ? `<@&${roleId}>` : '*(role not set up)*';
    return `${emoji} **${mode.label}** → ${roleMention}`;
  });

  return new EmbedBuilder()
    .setColor(config.colors.primary)
    .setTitle('🎮 Select Your Gamemodes')
    .setDescription(
      [
        'React below to **toggle** gamemode roles.',
        'Add a reaction to **get** the role, remove it to **lose** the role.',
        '',
        ...lines,
      ].join('\n')
    )
    .setFooter({ text: config.brand })
    .setTimestamp();
}

async function addPanelReactions(message) {
  for (const mode of GAME_MODES) {
    const emojiId = getGameModeEmojiId(mode.key);
    const emoji = emojiId ? message.guild.emojis.cache.get(emojiId) : null;
    try {
      if (emoji) {
        await message.react(emoji);
      } else {
        // No custom emoji set up yet for this mode - fall back to the unicode one.
        await message.react(getGameModeEmoji(mode.key));
      }
    } catch (err) {
      logger.error(`Failed to react with ${mode.key} emoji: ${err.message}`);
    }
  }
}

function findModeByEmoji(reactionEmoji) {
  for (const mode of GAME_MODES) {
    const emojiId = getGameModeEmojiId(mode.key);
    if (emojiId && reactionEmoji.id === emojiId) {
      return mode;
    }
    // If no custom emoji is set up, match against the unicode fallback.
    if (!emojiId && reactionEmoji.name === mode.fallback) {
      return mode;
    }
  }
  return null;
}

module.exports = { ensureGameModeRoles, buildRolePanelEmbed, addPanelReactions, findModeByEmoji };
