const { SlashCommandBuilder } = require("discord.js");

export default {
    data: new SlashCommandBuilder()
        .setName('patata')
        .setDescription('Patata :3'),
    async execute(interaction) {
        await interaction.reply(`Patata :3`)
    },
}