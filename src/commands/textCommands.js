import { SlashCommandBuilder } from "discord.js";
import { TextModels } from "../constants/models.js";
import { getGptResponse } from "../openai/gptHandler.js";
import { getGeminiMultimodalResponse } from "../google/geminiHandler.js";
import { getO4MiniResponse } from "../openai/o4Handler.js";
import {
  splitMessage,
  downloadImageToLocal,
  extractTextFromPdf,
} from "../utils/util.js";
import {
  AZURE_GPT_4O_NAME,
  GEMINI_FLASH_MODEL,
  GEMINI_PRO_MODEL,
  AZURE_O4_MINI_NAME,
} from "../config.js";
import fs from "fs";

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
          .setDescription("Optional image (o4-mini is not supported)")
          .setRequired(false)
      )
      .addAttachmentOption((option) =>
        option
          .setName("pdf")
          .setDescription("Attach a PDF file (max 20MB, Gemini only)")
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
      const pdfAttachment = interaction.options.getAttachment("pdf");
      let pdfPath = null;
      let localPath = null;

      try {
        if (model === GEMINI_FLASH_MODEL || model === GEMINI_PRO_MODEL) {
          if (attachment) {
            localPath = await downloadImageToLocal(
              attachment.url,
              `${Date.now()}_${attachment.name}`
            );
          }

          if (
            pdfAttachment &&
            (pdfAttachment.contentType !== "application/pdf" ||
              pdfAttachment.size > 20 * 1024 * 1024)
          ) {
            await interaction.editReply(
              "❌ Only 1 PDF file (max 20MB) is allowed."
            );
            return;
          }

          if (pdfAttachment) {
            pdfPath = await downloadImageToLocal(
              pdfAttachment.url,
              `${Date.now()}_${pdfAttachment.name}`
            );
          }

          const result = await getGeminiMultimodalResponse(
            prompt,
            localPath,
            model,
            pdfPath
          );

          const messages = splitMessage(result);
          await interaction.editReply(messages[0]);
          for (let i = 1; i < messages.length; i++) {
            await interaction.followUp(messages[i]);
          }

          if (localPath) fs.unlinkSync(localPath);
          if (pdfPath) fs.unlinkSync(pdfPath);
          return;
        }

        if (model === AZURE_GPT_4O_NAME) {
          let imageUrl = null;
          if (attachment) {
            imageUrl = attachment.url;
          }

          if (
            pdfAttachment &&
            (pdfAttachment.contentType !== "application/pdf" ||
              pdfAttachment.size > 20 * 1024 * 1024)
          ) {
            await interaction.editReply(
              "❌ Only 1 PDF file (max 20MB) is allowed."
            );
            return;
          }

          let pdfText = "";
          if (pdfAttachment) {
            pdfPath = await downloadImageToLocal(
              pdfAttachment.url,
              `${Date.now()}_${pdfAttachment.name}`
            );
            pdfText = await extractTextFromPdf(pdfPath);
            fs.unlinkSync(pdfPath);
          }

          let fullPrompt = prompt;
          if (pdfText) {
            fullPrompt += `\n\nThe following is the extracted text from the uploaded PDF:\n${pdfText}`;
          }

          const response = await getGptResponse(fullPrompt, model, imageUrl);
          const messages = splitMessage(response);
          await interaction.editReply(messages[0]);
          for (let i = 1; i < messages.length; i++) {
            await interaction.followUp(messages[i]);
          }
          return;
        }

        if (model === AZURE_O4_MINI_NAME) {
          const response = await getO4MiniResponse(prompt);
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
