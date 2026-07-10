const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

const runtimeConfig = require('../utils/runtimeConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setjoinwaitlistchannel')
        .setDescription('Sets the channel that will contain the Join Queue panel.')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Panel channel')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        runtimeConfig.setJoinWaitlistChannelId(channel.id);

        await interaction.reply({
            content: `✅ Join waitlist channel has been set to ${channel}.`,
            ephemeral: true,
        });
    },
};
