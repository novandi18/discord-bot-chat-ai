import {
  QUEUE_EMOJIS,
  QUEUE_TYPE_NAMES,
  QUEUE_TYPES,
} from "../../constants/QueueTypes.js";

export async function processVideo(interaction, data) {
  const emoji = QUEUE_EMOJIS[QUEUE_TYPES.VIDEO];
  const typeName = QUEUE_TYPE_NAMES[QUEUE_TYPES.VIDEO];

  try {
    await interaction.editReply(`${emoji} Processing your ${typeName}...`);

    const { generateVeo } = await import("../../google/veoHandler.js");
    const files = await generateVeo(data.prompt);

    if (files && files.length) {
      await interaction.editReply({ files: [files[0]] });

      for (let i = 1; i < files.length; i++) {
        await interaction.followUp({ files: [files[i]] });
      }

      return files;
    } else {
      await interaction.editReply(`❌ No file generated for ${typeName}.`);
      return [];
    }
  } catch (error) {
    console.error(`Error generating ${typeName}:`, error);
    await interaction.editReply(`❌ Error generating ${typeName}.`);
    throw error;
  }
}
