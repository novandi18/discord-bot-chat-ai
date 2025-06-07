import { SlashCommandBuilder } from "discord.js";
import { ImageModels, AspectRatios } from "../constants/models.js";
import { mediaQueue } from "../utils/queueHandler.js";
import { IMAGEN_3_MODEL } from "../config.js";

export const imageCommands = {
  definitions: [
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
  ],

  handlers: {
    async image(interaction) {
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
    },
  },
};
