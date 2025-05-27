import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
import { getGptResponse } from "./openai/gptHandler.js";
import { getGeminiResponse } from "./gemini/geminiHandler.js";
import { generateImagen3 } from "./gemini/imagenHandler.js";
import {
  GUILD_ID,
  DISCORD_BOT_TOKEN,
  DISCORD_BOT_CLIENT_ID,
  OPENAI_MODEL,
  GEMINI_FLASH_MODEL,
  GEMINI_PRO_MODEL,
  IMAGEN_MODEL,
} from "./config.js";
import { splitMessage } from "./utils/util.js";

const modelChoices = [
  { name: "GPT-4o", value: OPENAI_MODEL },
  { name: "Gemini 2.5 Flash", value: GEMINI_FLASH_MODEL },
  { name: "Gemini 2.5 Pro", value: GEMINI_PRO_MODEL },
  { name: "Imagen 3", value: IMAGEN_MODEL },
];

const commands = [
  new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Chat with AI")
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
      if (interaction.commandName === "chat") {
        await interaction.deferReply({
          content: "Reasoning...",
        });
        const model = interaction.options.getString("model");
        const prompt = interaction.options.getString("prompt");
        try {
          let response;
          if (model === OPENAI_MODEL) {
            response = await getGptResponse(prompt, model);
          } else if (
            model === GEMINI_FLASH_MODEL ||
            model === GEMINI_PRO_MODEL
          ) {
            response = await getGeminiResponse(prompt, model);
          } else if (model === IMAGEN_MODEL) {
            const filePaths = await generateImagen3(prompt);
            response = "Image generated.";
            await interaction.editReply(response);
            for (const filePath of filePaths) {
              await interaction.followUp({ files: [filePath] });
            }
            return;
          }

          const messages = splitMessage(
            typeof response === "string" ? response : JSON.stringify(response)
          );
          await interaction.editReply(messages[0]);
          for (let i = 1; i < messages.length; i++) {
            await interaction.followUp(messages[i]);
          }
        } catch (err) {
          console.error("Error processing command:", err);
          await interaction.editReply(
            "An error occurred while processing the request."
          );
        }
      }
    });

    client.login(DISCORD_BOT_TOKEN);
    console.log("Bot is running...");
  } catch (error) {
    console.error("Error registering slash command or running bot:", error);
  }
}

main();
