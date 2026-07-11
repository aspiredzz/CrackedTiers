const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setupGameModeEmojis } = require('../utils/emojiManager');
const { isStaff } = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupemojis')
    .setDescription('Upload the CDTIERS gamemode icons as custom server emojis (Staff only)'),

  async execute(interaction) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const botMember = await interaction.guild.members.fetchMe();
    if (!botMember.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
      return interaction.reply({
        content:
          '❌ I need the **Manage Expressions** (Manage Emojis and Stickers) permission to upload these icons. Grant it to my role and try again.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const results = await setupGameModeEmojis(interaction.guild);

    const lines = results.map((r) =>
      r.success ? `${r.mention} **${r.label}** - ready` : `❌ **${r.label}** - failed (${r.error})`
    );

    await interaction.editReply({
      content: `**Gamemode emoji setup:**\n${lines.join('\n')}`,
    });
  },
};
