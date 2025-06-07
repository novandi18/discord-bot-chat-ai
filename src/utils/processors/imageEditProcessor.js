import {
  QUEUE_EMOJIS,
  QUEUE_TYPE_NAMES,
  QUEUE_TYPES,
} from "../../constants/QueueTypes.js";
import fs from "fs/promises";

export async function processImageEdit(interaction, data) {
  const emoji = QUEUE_EMOJIS[QUEUE_TYPES.EDIT];
  const typeName = QUEUE_TYPE_NAMES[QUEUE_TYPES.EDIT];

  try {
    await interaction.editReply(`${emoji} Processing your ${typeName}...`);

    const { generateGeminiEdit } = await import(
      "../../google/geminiHandler.js"
    );

    if (!data.tmpPath || !(await fileExists(data.tmpPath))) {
      await interaction.editReply(`❌ Image file not found.`);
      return [];
    }

    const files = await generateGeminiEdit(data.prompt, data.tmpPath);

    if (files && files.length) {
      await interaction.editReply({
        content: `${emoji} Here's your ${typeName}:`,
        files: [files[0]],
      });

      for (let i = 1; i < files.length; i++) {
        await interaction.followUp({ files: [files[i]] });
      }

      return files;
    } else {
      await interaction.editReply(`❌ No file generated for ${typeName}.`);
      return [];
    }
  } catch (error) {
    console.error(`Error processing ${typeName}:`, error);
    await interaction.editReply(
      `❌ Error generating ${typeName}. ${error.message}`
    );
    throw error;
  } finally {
    try {
      if (data.tmpPath && (await fileExists(data.tmpPath))) {
        await fs.unlink(data.tmpPath);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up temporary file:", cleanupError);
    }
  }
}

/**
 * Check if a file exists
 *
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} - Whether the file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
