const runtimeConfig = require('../utils/runtimeConfig');
const { findModeByEmoji } = require('../utils/reactionRoles');
const { logger } = require('../utils/logger');

module.exports = {
  name: 'messageReactionAdd',
  once: false,
  async execute(reaction, user) {
    if (user.bot) return;

    try {
      if (reaction.partial) await reaction.fetch();
      if (reaction.message.partial) await reaction.message.fetch();
    } catch (err) {
      logger.error(`Failed to fetch partial reaction: ${err.message}`);
      return;
    }

    const panel = runtimeConfig.getRolePanel();
    if (!panel.messageId || reaction.message.id !== panel.messageId) return;

    const mode = findModeByEmoji(reaction.emoji);
    if (!mode) return;

    const roleId = runtimeConfig.getGameModeRole(mode.key);
    if (!roleId) return;

    try {
      const member = await reaction.message.guild.members.fetch(user.id);
      if (!member.roles.cache.has(roleId)) {
        await member.roles.add(roleId);
      }
    } catch (err) {
      logger.error(`Failed to add ${mode.key} role to ${user.id}: ${err.message}`);
    }
  },
};
