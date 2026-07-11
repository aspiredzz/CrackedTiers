// ============================================================
// CDTIERS Bot - /addtester
// Staff only. Grants a specific user staff-level access to the
// queue commands (/startqueue, /nextplayer, /results, etc.)
// without needing to give them a whole staff role.
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const runtimeConfig = require('../utils/runtimeConfig');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addtester')
    .setDescription('Grant a member tester/staff access to queue commands (Staff only)')
    .addUserOption((option) =>
      option.setName('user').setDescription('The member to add as a tester').setRequired(true)
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('user');

    if (runtimeConfig.isTester(target.id)) {
      return interaction.reply({
        content: `⚠️ <@${target.id}> is already a tester.`,
        ephemeral: true,
      });
    }

    runtimeConfig.addTester(target.id);

    await interaction.reply({
      content: `✅ <@${target.id}> can now use tester/staff commands (startqueue, nextplayer, results, etc).`,
      ephemeral: true,
    });
  },
};
