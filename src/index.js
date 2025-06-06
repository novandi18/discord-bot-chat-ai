import "dotenv/config";
import fs from "node:fs";
import path from "path";
import axios from "axios";
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
import { splitMessage } from "./utils/util.js";
import {
  GUILD_ID,
  DISCORD_BOT_CLIENT_ID,
  DISCORD_BOT_TOKEN,
  OPENAI_MODEL,
  GEMINI_FLASH_MODEL,
  GEMINI_PRO_MODEL,
  IMAGEN_MODEL,
  VEO_MODEL,
  GEMINI_IMAGE_EDIT_MODEL,
} from "./config.js";

// define /chat model choices
const chatModels = [
  { name: "GPT-4o", value: OPENAI_MODEL },
  { name: "Gemini 2.5 Flash", value: GEMINI_FLASH_MODEL },
  { name: "Gemini 2.5 Pro", value: GEMINI_PRO_MODEL },
];

export const commands = [
  new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Chat with text AI models")
    .addStringOption((option) =>
      option
        .setName("model")
        .setDescription("Choose a text model")
        .setRequired(true)
        .addChoices(...chatModels)
    )
    .addStringOption((option) =>
      option.setName("prompt").setDescription("Your message").setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("video")
    .setDescription(`Generate a video using Veo 2`)
    .addStringOption((option) =>
      option.setName("prompt").setDescription("Video prompt").setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("image")
    .setDescription(`Generate an image using Imagen 3`)
    .addStringOption((option) =>
      option.setName("prompt").setDescription("Image prompt").setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("edit_image")
    .setDescription(`Edit an image using Gemini 2.0 Flash Image Generation`)
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("Upload image to edit")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Edit instructions")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("View generation queue status")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show bot commands")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Reset all slash commands (admin)")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reload all slash commands (admin)")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

async function main() {
  try {
    // register slash commands
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_BOT_CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("✅ Registered slash commands.");

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    let videoUsage = { date: null, count: 0 };

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      try {
        switch (interaction.commandName) {
          case "chat": {
            await interaction.deferReply();
            const model = interaction.options.getString("model");
            const prompt = interaction.options.getString("prompt");

            let response;
            if (model === OPENAI_MODEL) {
              response = await getGptResponse(prompt, model);
            } else {
              response = await getGeminiResponse(prompt, model);
            }
            const parts = splitMessage(
              typeof response === "string" ? response : JSON.stringify(response)
            );
            await interaction.editReply(parts[0]);
            for (let i = 1; i < parts.length; i++) {
              await interaction.followUp(parts[i]);
            }
            break;
          }

          case "video": {
            // reset counter when the day changes
            const today = new Date().toISOString().slice(0, 10);
            if (videoUsage.date !== today) {
              videoUsage.date = today;
              videoUsage.count = 0;
            }

            // enforce 5‐per‐day limit
            if (videoUsage.count >= 5) {
              return interaction.reply({
                content:
                  "❌ You’ve reached the daily limit of 5 video generations. Try again tomorrow!",
                ephemeral: true,
              });
            }
            videoUsage.count++;

            await interaction.deferReply(
              "⏳ Queued video generation with Veo 2"
            );
            const prompt = interaction.options.getString("prompt");
            await mediaQueue.addToQueue(interaction, prompt, "video");
            break;
          }

          case "image": {
            await interaction.deferReply(
              "⏳ Queued image generation with Imagen 3"
            );
            const prompt = interaction.options.getString("prompt");
            await mediaQueue.addToQueue(interaction, prompt, "image");
            break;
          }

          case "edit_image": {
            await interaction.deferReply(
              "⏳ Queued image editing with Gemini 2.0 Flash"
            );
            const attachment = interaction.options.getAttachment("image");
            const prompt = interaction.options.getString("prompt");

            // validate format
            const name = attachment.name.toLowerCase();
            if (
              !name.endsWith(".png") &&
              !name.endsWith(".jpg") &&
              !name.endsWith(".jpeg")
            ) {
              return interaction.editReply("❌ Only PNG/JPG allowed.");
            }
            // download to uploads/
            const uploadsDir = path.resolve("./uploads");
            if (!fs.existsSync(uploadsDir))
              fs.mkdirSync(uploadsDir, { recursive: true });
            const localName = `${Date.now()}_${attachment.name}`;
            const localPath = path.join(uploadsDir, localName);
            const resp = await axios.get(attachment.url, {
              responseType: "arraybuffer",
            });
            fs.writeFileSync(localPath, Buffer.from(resp.data), "binary");

            await mediaQueue.addToQueue(
              interaction,
              { prompt, imagePath: localPath },
              "gemini-edit"
            );
            break;
          }

          case "queue":
            await handleQueueCommand(interaction);
            break;

          case "help":
            await handleHelpCommand(interaction);
            break;

          case "reset":
            await handleResetCommands(interaction);
            break;

          case "reload":
            await handleReloadCommands(interaction);
            break;
        }
      } catch (err) {
        console.error("❌ Interaction error:", err);
        if (!interaction.deferred && !interaction.replied) {
          await interaction.reply({
            content: "Error occurred.",
            ephemeral: true,
          });
        } else {
          await interaction.editReply("Error occurred.");
        }
      }
    });

    client.on("ready", () => {
      console.log(`✅ Logged in as ${client.user.tag}`);
    });

    await client.login(DISCORD_BOT_TOKEN);
  } catch (err) {
    console.error("❌ Startup error:", err);
    setTimeout(main, 5000);
  }
}

main();
