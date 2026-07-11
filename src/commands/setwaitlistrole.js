// ============================================================
// CDTIERS Bot - /setwaitlistrole
// Staff only. Sets the WAITLIST/QUEUE role that gets granted to
// a player the moment they join the queue, and removed the
// moment they leave/finish/get removed. Persisted, no redeploy
// needed to change it.
// ============================================================

const { SlashCommandBuilder } = require('discord.js');
const runtimeConfig = require('../utils/runtimeConfig');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setwaitlistrole')
    .setDescription('Set the WAITLIST/QUEUE role given to queued players (Staff only)')
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The role to grant while a player is in the queue')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const role = interaction.options.getRole('role');

    if (role.managed || role.id === interaction.guild.roles.everyone.id) {
      return interaction.reply({
        content: '❌ That role can\'t be used (it\'s a managed role or @everyone). Pick a normal role.',
        ephemeral: true,
      });
    }

    runtimeConfig.setWaitlistRoleId(role.id);

    await interaction.reply({
      content: `✅ WAITLIST/QUEUE role set to <@&${role.id}>. Make sure my role is positioned **above** it in Server Settings → Roles, or I won't be able to assign it.`,
      ephemeral: true,
    });
  },
};
