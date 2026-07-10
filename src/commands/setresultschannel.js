const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

const runtimeConfig = require('../utils/runtimeConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setresultschannel')
        .setDescription('Sets the channel where test results will be sent.')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Results channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        runtimeConfig.setResultsChannelId(channel.id);

        await interaction.reply({
            content: `✅ Results channel has been set to ${channel}.`,
            ephemeral: true,
        });
    },
};
