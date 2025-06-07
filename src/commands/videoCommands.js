import { SlashCommandBuilder } from "discord.js";
import { VideoModels } from "../constants/models.js";
import { mediaQueue } from "../utils/queueHandler.js";

export const videoCommands = {
  definitions: [
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
  ],

  handlers: {
    async video(interaction) {
      await interaction.deferReply({
        content: "Generating video...",
      });

      const prompt = interaction.options.getString("prompt");
      await mediaQueue.addToQueue(interaction, { prompt }, "video");
    },
  },
};
