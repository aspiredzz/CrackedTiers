const {
    SlashCommandBuilder,
    PermissionFlagsBits,
} = require('discord.js');

const runtimeConfig = require('../utils/runtimeConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removetester')
        .setDescription('Removes a tester.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to remove')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const user = interaction.options.getUser('user');

        if (!runtimeConfig.isTester(user.id)) {
            return interaction.reply({
                content: '❌ That user is not a tester.',
                ephemeral: true,
            });
        }

        runtimeConfig.removeTester(user.id);

        await interaction.reply({
            content: `✅ ${user.tag} has been removed as a tester.`,
            ephemeral: true,
        });
    },
};
