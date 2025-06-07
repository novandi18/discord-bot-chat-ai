import { SlashCommandBuilder } from "discord.js";
import { ImageEditingModels } from "../constants/models.js";
import { mediaQueue } from "../utils/queue/index.js";
import { downloadImageToLocal } from "../utils/util.js";

export const imageEditCommands = {
  definitions: [
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
  ],

  handlers: {
    async image_edit(interaction) {
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
    },
  },
};
