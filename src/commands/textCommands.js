import { SlashCommandBuilder } from "discord.js";
import { TextModels } from "../constants/models.js";
import { getGptResponse } from "../openai/gptHandler.js";
import { getGeminiResponse } from "../google/geminiHandler.js";
import { splitMessage } from "../utils/util.js";
import {
  OPENAI_MODEL,
  GEMINI_FLASH_MODEL,
  GEMINI_PRO_MODEL,
} from "../config.js";

export const textCommands = {
  definitions: [
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
  ],

  handlers: {
    async chat(interaction) {
      await interaction.deferReply({
        content: "Thinking...",
      });

      const model = interaction.options.getString("model");
      const prompt = interaction.options.getString("prompt");

      try {
        let response;

        if (model === OPENAI_MODEL) {
          response = await getGptResponse(prompt, model);
        } else if (model === GEMINI_FLASH_MODEL || model === GEMINI_PRO_MODEL) {
          response = await getGeminiResponse(prompt, model);
        } else {
          await interaction.editReply("Model is not recognized.");
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
        console.error("❌ Error processing AI command:", err);
        try {
          await interaction.editReply(
            "An error occurred while processing the request. Please try again later."
          );
        } catch (replyError) {
          console.error("❌ Error sending error reply:", replyError);
        }
      }
    },
  },
};
