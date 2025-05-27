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
  GUILD_ID,
  DISCORD_BOT_TOKEN,
  DISCORD_BOT_CLIENT_ID,
  OPENAI_MODEL,
  GEMINI_FLASH_MODEL,
  GEMINI_PRO_MODEL,
  IMAGEN_MODEL,
  VEO_MODEL,
} from "./config.js";
import { splitMessage } from "./utils/util.js";

const modelChoices = [
  { name: "GPT-4o", value: OPENAI_MODEL },
  { name: "Gemini 2.5 Flash", value: GEMINI_FLASH_MODEL },
  { name: "Gemini 2.5 Pro", value: GEMINI_PRO_MODEL },
  { name: "Imagen 3", value: IMAGEN_MODEL },
  { name: "Veo 2", value: VEO_MODEL },
];

const commands = [
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
    .toJSON(),

  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Check generation queue status")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show bot commands and usage information")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

async function main() {
  try {
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_BOT_CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log("Slash command registered!");

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

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
              typeof response === "string" ? response : JSON.stringify(response)
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
              typeof response === "string" ? response : JSON.stringify(response)
            );
            await interaction.editReply(messages[0]);
            for (let i = 1; i < messages.length; i++) {
              await interaction.followUp(messages[i]);
            }
          } else if (model === IMAGEN_MODEL) {
            // Tambahkan ke antrian image
            await mediaQueue.addToQueue(interaction, prompt, "image");
          } else if (model === VEO_MODEL) {
            // Tambahkan ke antrian video
            await mediaQueue.addToQueue(interaction, prompt, "video");
          } else {
            await interaction.editReply("Model is not recognized.");
          }
        } catch (err) {
          console.error("Error processing command:", err);
          await interaction.editReply(
            "An error occurred while processing the request."
          );
        }
      } else if (interaction.commandName === "queue") {
        await handleQueueCommand(interaction);
      } else if (interaction.commandName === "help") {
        await handleHelpCommand(interaction);
      }
    });

    client.login(DISCORD_BOT_TOKEN);
    console.log("Bot is running...");
  } catch (error) {
    console.error("Error registering slash command or running bot:", error);
  }
}

main();
