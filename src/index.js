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
import {
  GUILD_ID,
  DISCORD_BOT_TOKEN,
  DISCORD_BOT_CLIENT_ID,
} from "./config.js";

const commands = [
  new SlashCommandBuilder()
    .setName("chat")
    .setDescription("Chat with AI")
    .addStringOption((option) =>
      option
        .setName("model")
        .setDescription("Choose AI model:")
        .setRequired(true)
        .addChoices(
          { name: "GPT-4o", value: "gpt" },
          { name: "Gemini 2.5 Flash", value: "gemini" }
        )
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
        const model = interaction.options.getString("model");
        const prompt = interaction.options.getString("prompt");
        await interaction.deferReply();
        try {
          let response;
          if (model === "gpt") {
            response = await getGptResponse(prompt);
          } else if (model === "gemini") {
            response = await getGeminiResponse(prompt);
          } else {
            response = "Model is not recognized.";
          }
          await interaction.editReply(response);
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
