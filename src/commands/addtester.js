const {
    SlashCommandBuilder,
    PermissionFlagsBits,
} = require('discord.js');

const runtimeConfig = require('../utils/runtimeConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addtester')
        .setDescription('Adds a tester.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to add as tester')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const user = interaction.options.getUser('user');

        if (runtimeConfig.isTester(user.id)) {
            return interaction.reply({
                content: '❌ That user is already a tester.',
                ephemeral: true,
            });
        }

        runtimeConfig.addTester(user.id);

        await interaction.reply({
            content: `✅ ${user.tag} has been added as a tester.`,
            ephemeral: true,
        });
    },
};
