import "dotenv/config";
import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { commandDefinitions, commandHandlers } from "./commands/index.js";
import {
  GUILD_ID,
  DISCORD_BOT_TOKEN,
  DISCORD_BOT_CLIENT_ID,
} from "./config.js";

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
});

export const commands = commandDefinitions;

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

async function main() {
  try {
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_BOT_CLIENT_ID, GUILD_ID),
      { body: commandDefinitions }
    );
    console.log("✅ Slash commands registered!");

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    client.on("error", (error) => {
      console.error("❌ Discord Client Error:", error);
    });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      try {
        const commandName = interaction.commandName;

        if (commandHandlers[commandName]) {
          await commandHandlers[commandName](interaction);
        } else {
          console.warn(`No handler found for command: ${commandName}`);
        }
      } catch (err) {
        console.error("Command error:", err);
        try {
          if (interaction.deferred) {
            await interaction.editReply({
              content: "An unexpected error occurred.",
            });
          } else if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              content: "An unexpected error occurred.",
              ephemeral: true,
            });
          }
        } catch (sendErr) {
          console.error("❌ Failed to send error reply:", sendErr);
        }
      }
    });

    client.on("ready", () => {
      console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    });

    await client.login(DISCORD_BOT_TOKEN);
    console.log("🚀 Bot is running...");
  } catch (error) {
    console.error("❌ Error in main function:", error);
    setTimeout(() => {
      console.log("🔄 Attempting to restart main function...");
      main();
    }, 5000);
  }
}

main();
