import { REST, Routes } from "discord.js";
import {
  DISCORD_BOT_CLIENT_ID,
  DISCORD_BOT_TOKEN,
  GUILD_ID,
} from "../config.js";
import { commands } from "../index.js";

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

export async function handleResetCommands(interaction) {
  try {
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_BOT_CLIENT_ID, GUILD_ID),
      { body: [] }
    );
    await interaction.reply({
      content: "✅ All guild slash commands have been **reset** (deleted).",
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error resetting commands:", error);
    await interaction.reply({
      content: "Failed to reset commands.",
      ephemeral: true,
    });
  }
}

export async function handleReloadCommands(interaction) {
  try {
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_BOT_CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    await interaction.reply({
      content:
        "✅ All guild slash commands have been **reloaded** (registered).",
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error reloading commands:", error);
    await interaction.reply({
      content: "Failed to reload commands.",
      ephemeral: true,
    });
  }
}
