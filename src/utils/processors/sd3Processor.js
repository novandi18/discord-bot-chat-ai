import {
  QUEUE_EMOJIS,
  QUEUE_TYPE_NAMES,
  QUEUE_TYPES,
} from "../../constants/QueueTypes.js";
import { generateSD3Image } from "../../azure/sd3Handler.js";

export async function processSD3Large(interaction, data) {
  const emoji = QUEUE_EMOJIS[QUEUE_TYPES.AZURE_SD3_LARGE];
  const typeName = QUEUE_TYPE_NAMES[QUEUE_TYPES.AZURE_SD3_LARGE];

  try {
    await interaction.editReply(`${emoji} Processing your ${typeName}...`);
    const files = await generateSD3Image(data.prompt, data.aspectRatio);

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
