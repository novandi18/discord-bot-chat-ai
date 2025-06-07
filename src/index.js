import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { getGptResponse } from "./openai/gptHandler.js";
import { getGeminiResponse } from "./google/geminiHandler.js";
import { mediaQueue } from "./utils/queueHandler.js";
import { handleHelpCommand } from "./utils/helpHandler.js";
import { handleQueueCommand } from "./utils/queueStatusHandler.js";
import {
  handleResetCommands,
  handleReloadCommands,
} from "./utils/reloadHandler.js";
import {
  GUILD_ID,
  DISCORD_BOT_TOKEN,
  DISCORD_BOT_CLIENT_ID,
  OPENAI_MODEL,
  GEMINI_FLASH_MODEL,
  GEMINI_PRO_MODEL,
  GEMINI_IMAGE_EDIT_MODEL,
  IMAGEN_MODEL,
  VEO_MODEL,
} from "./config.js";
import { splitMessage, downloadImageToLocal } from "./utils/util.js";

// Global Error Handlers
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
});

const modelChoices = [
  { name: "GPT-4o", value: OPENAI_MODEL },
  { name: "Gemini 2.5 Flash", value: GEMINI_FLASH_MODEL },
  { name: "Gemini 2.5 Pro", value: GEMINI_PRO_MODEL },
  { name: "Gemini 2.0 Flash Image Generation", value: GEMINI_IMAGE_EDIT_MODEL },
  { name: "Imagen 3", value: IMAGEN_MODEL },
  { name: "Veo 2", value: VEO_MODEL },
];

export const commands = [
  new SlashCommandBuilder()
    .setName("ai")
    .setDescription("Generate with AI")
    .addStringOption((option) =>
      option
        .setName("model")
        .setDescription("Choose AI model:")
        .setRequired(true)
        .addChoices(...modelChoices)
    )
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Message to send to AI")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("Image to send to AI")
        .setRequired(false)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Check generation queue status")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show bot commands and usage information")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Reset (delete) all guild slash commands")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reload (register) all guild slash commands")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

async function main() {
  try {
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_BOT_CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Slash command registered!");

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    // Discord Client Error Handler
    client.on("error", (error) => {
      console.error("❌ Discord Client Error:", error);
    });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      try {
        if (interaction.commandName === "ai") {
          await interaction.deferReply({
            content: "AI is thinking...",
          });

          const model = interaction.options.getString("model");
          const prompt = interaction.options.getString("prompt");

          try {
            let response;

            if (model === OPENAI_MODEL) {
              response = await getGptResponse(prompt, model);
              const messages = splitMessage(
                typeof response === "string"
                  ? response
                  : JSON.stringify(response)
              );
              await interaction.editReply(messages[0]);
              for (let i = 1; i < messages.length; i++) {
                await interaction.followUp(messages[i]);
              }
            } else if (
              model === GEMINI_FLASH_MODEL ||
              model === GEMINI_PRO_MODEL
            ) {
              response = await getGeminiResponse(prompt, model);
              const messages = splitMessage(
                typeof response === "string"
                  ? response
                  : JSON.stringify(response)
              );
              await interaction.editReply(messages[0]);
              for (let i = 1; i < messages.length; i++) {
                await interaction.followUp(messages[i]);
              }
            } else if (model === IMAGEN_MODEL) {
              await mediaQueue.addToQueue(interaction, prompt, "image");
            } else if (model === VEO_MODEL) {
              await mediaQueue.addToQueue(interaction, prompt, "video");
            } else if (model === GEMINI_IMAGE_EDIT_MODEL) {
              const attachment = interaction.options.getAttachment("image");
              if (!attachment) {
                return interaction.editReply(
                  "⚠️ For Gemini 2.0 Flash Image Generation, you must upload an image."
                );
              }
              let localPath;
              try {
                localPath = await downloadImageToLocal(
                  attachment.url,
                  `${Date.now()}_${attachment.name}`
                );
              } catch (err) {
                console.error("Download image gagal:", err);
                return interaction.editReply(
                  "❌ Failed to download image. Please try again."
                );
              }
              await mediaQueue.addToQueue(
                interaction,
                { prompt, tmpPath: localPath },
                "edit"
              );
            } else {
              await interaction.editReply("Model is not recognized.");
            }
          } catch (err) {
            console.error("❌ Error processing AI command:", err);
            try {
              await interaction.editReply(
                "An error occurred while processing the request. Please try again later."
              );
            } catch (replyError) {
              console.error("❌ Error sending error reply:", replyError);
            }
          }
        } else if (interaction.commandName === "queue") {
          await handleQueueCommand(interaction);
        } else if (interaction.commandName === "help") {
          await handleHelpCommand(interaction);
        } else if (interaction.commandName === "reset") {
          await handleResetCommands(interaction);
        } else if (interaction.commandName === "reload") {
          await handleReloadCommands(interaction);
        }
      } catch (err) {
        console.error("❌ Error in interaction handler:", err);
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              content: "An unexpected error occurred. Please try again later.",
              flags: 64, // Ephemeral flag yang benar
            });
          } else if (interaction.deferred) {
            await interaction.editReply(
              "An unexpected error occurred. Please try again later."
            );
          }
        } catch (replyError) {
          console.error("❌ Error sending error reply:", replyError);
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
