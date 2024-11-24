import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Returns the bot's ping."),
  async execute(interaction) {
    const ping = Math.round(interaction.client.ws.ping);
    await interaction.reply(`Pong! Bot ping is ${ping}ms.`);
  },
};
