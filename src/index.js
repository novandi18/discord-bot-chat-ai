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
  IMAGEN_3_MODEL,
} from "./config.js";
import {
  TextModels,
  VideoModels,
  ImageModels,
  ImageEditingModels,
  AspectRatios,
} from "./constants/models.js";
import { splitMessage, downloadImageToLocal } from "./utils/util.js";

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise);
  console.error("Reason:", reason);
});

export const commands = [
  new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Generate text with AI Models")
    .addStringOption((o) =>
      o
        .setName("model")
        .setDescription("Choose model:")
        .setRequired(true)
        .addChoices(...TextModels)
    )
    .addStringOption((o) =>
      o.setName("prompt").setDescription("Your message").setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("video")
    .setDescription("Generate video with AI Models")
    .addStringOption((o) =>
      o
        .setName("model")
        .setDescription("Choose model:")
        .setRequired(true)
        .addChoices(...VideoModels)
    )
    .addStringOption((o) =>
      o.setName("prompt").setDescription("Your prompt").setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("image")
    .setDescription("Generate an image (queued)")
    .addStringOption((o) =>
      o
        .setName("model")
        .setDescription("Choose image model:")
        .setRequired(true)
        .addChoices(...ImageModels)
    )
    .addStringOption((o) =>
      o
        .setName("prompt")
        .setDescription("Text prompt for image")
        .setRequired(true)
    )
    .addStringOption((o) =>
      o
        .setName("aspect_ratio")
        .setDescription("Aspect ratio (optional)")
        .setRequired(false)
        .addChoices(...AspectRatios)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("image_edit")
    .setDescription("Edit image with AI (queued)")
    .addStringOption((o) =>
      o
        .setName("model")
        .setDescription("Choose edit model:")
        .setRequired(true)
        .addChoices(...ImageEditingModels)
    )
    .addStringOption((o) =>
      o
        .setName("prompt")
        .setDescription("Editing instructions")
        .setRequired(true)
    )
    .addAttachmentOption((o) =>
      o
        .setName("image")
        .setDescription("Upload an image to edit")
        .setRequired(true)
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
        switch (interaction.commandName) {
          case "chat": {
            await interaction.deferReply({
              content: "Thinking...",
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
            break;
          }

          case "image": {
            await interaction.deferReply({
              content: "Generating image...",
            });

            const prompt = interaction.options.getString("prompt");
            const model = interaction.options.getString("model");
            const type = model === IMAGEN_3_MODEL ? "imagen3" : "imagen4";
            const aspectRatio =
              interaction.options.getString("aspect_ratio") || "1:1";

            await mediaQueue.addToQueue(
              interaction,
              { prompt, model, aspectRatio },
              type
            );

            break;
          }

          case "video": {
            await interaction.deferReply({
              content: "Generating video...",
            });

            await mediaQueue.addToQueue(interaction, { prompt }, "video");
            break;
          }

          case "image_edit": {
            await interaction.deferReply({
              content: "Editing your image...",
            });

            const prompt = interaction.options.getString("prompt");
            const attachment = interaction.options.getAttachment("image");
            if (!attachment) {
              return interaction.editReply("⚠️ You must upload an image.");
            }

            let localPath;
            try {
              localPath = await downloadImageToLocal(
                attachment.url,
                `${Date.now()}_${attachment.name}`
              );
            } catch (err) {
              console.error("Failed to download image:", err);
              return interaction.editReply(
                "❌ Failed to download image. Please try again."
              );
            }

            await mediaQueue.addToQueue(
              interaction,
              { prompt, tmpPath: localPath },
              "edit"
            );

            break;
          }

          case "queue": {
            await handleQueueCommand(interaction);
            break;
          }

          case "help": {
            await handleHelpCommand(interaction);
            break;
          }

          case "reset": {
            await handleResetCommands(interaction);
            break;
          }

          case "reload": {
            await handleReloadCommands(interaction);
            break;
          }
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
