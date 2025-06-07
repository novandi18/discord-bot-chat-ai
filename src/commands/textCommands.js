import { SlashCommandBuilder } from "discord.js";
import { TextModels } from "../constants/models.js";
import { getGptResponse } from "../openai/gptHandler.js";
import { getGeminiMultimodalResponse } from "../google/geminiHandler.js";
import { splitMessage, downloadImageToLocal } from "../utils/util.js";
import {
  AZURE_GPT_4o_NAME,
  GEMINI_FLASH_MODEL,
  GEMINI_PRO_MODEL,
} from "../config.js";
import fs from "fs";
import path from "path";

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
      .addAttachmentOption((option) =>
        option
          .setName("image")
          .setDescription("Optional image to include in the prompt")
          .setRequired(false)
      )
      .toJSON(),
  ],

  handlers: {
    async chat(interaction) {
      await interaction.deferReply({ content: "Thinking..." });

      const model = interaction.options.getString("model");
      const prompt = interaction.options.getString("prompt");
      const attachment = interaction.options.getAttachment("image");

      try {
        if (model === GEMINI_FLASH_MODEL || model === GEMINI_PRO_MODEL) {
          let localPath = null;
          if (attachment) {
            localPath = await downloadImageToLocal(
              attachment.url,
              `${Date.now()}_${attachment.name}`
            );
          }
          const result = await getGeminiMultimodalResponse(
            prompt,
            localPath,
            model
          );

          if (result.text) {
            await interaction.editReply(result.text);
          } else {
            await interaction.editReply("No response from Gemini.");
          }
          for (const base64 of result.images) {
            const buffer = Buffer.from(base64, "base64");
            const fileName = `gemini_output_${Date.now()}.png`;
            const imagesDir = path.resolve("./images");
            if (!fs.existsSync(imagesDir))
              fs.mkdirSync(imagesDir, { recursive: true });
            const filePath = path.join(imagesDir, fileName);
            fs.writeFileSync(filePath, buffer);
            await interaction.followUp({ files: [filePath] });
          }
          if (localPath) fs.unlinkSync(localPath);
          return;
        }

        if (model === AZURE_GPT_4o_NAME) {
          let imageUrl = null;
          if (attachment) {
            imageUrl = attachment.url;
          }
          const response = await getGptResponse(prompt, model, imageUrl);
          const messages = splitMessage(response);
          await interaction.editReply(messages[0]);
          for (let i = 1; i < messages.length; i++) {
            await interaction.followUp(messages[i]);
          }
          return;
        }

        await interaction.editReply("Model is not recognized.");
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
