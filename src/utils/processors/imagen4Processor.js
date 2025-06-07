import {
  QUEUE_EMOJIS,
  QUEUE_TYPE_NAMES,
  QUEUE_TYPES,
} from "../../constants/QueueTypes.js";
import fs from "fs";
import path from "path";

export async function processImagen4(interaction, data) {
  const emoji = QUEUE_EMOJIS[QUEUE_TYPES.IMAGEN4];
  const typeName = QUEUE_TYPE_NAMES[QUEUE_TYPES.IMAGEN4];

  try {
    await interaction.editReply(`${emoji} Processing your ${typeName}...`);

    const { generateImagen4 } = await import("../../google/imagen4Handler.js");
    const predictions = await generateImagen4(
      data.prompt,
      1,
      data.model,
      data.aspectRatio || "1:1"
    );

    if (predictions && predictions.length) {
      const imagesDir = path.resolve("./images");
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }
      const filePaths = [];
      for (let i = 0; i < predictions.length; i++) {
        const base64 =
          predictions[i].bytesBase64Encoded ||
          predictions[i].imageBytes ||
          predictions[i];
        const buffer = Buffer.from(base64, "base64");
        const filePath = path.join(
          imagesDir,
          `imagen4-${Date.now()}-${i + 1}.png`
        );
        fs.writeFileSync(filePath, buffer);
        filePaths.push(filePath);
      }

      await interaction.editReply({
        content: `${emoji} Here's your ${typeName}:`,
        files: [filePaths[0]],
      });

      for (let i = 1; i < filePaths.length; i++) {
        await interaction.followUp({ files: [filePaths[i]] });
      }

      return filePaths;
    } else {
      await interaction.editReply(`❌ No file generated for ${typeName}.`);
      return [];
    }
  } catch (error) {
    console.error(`Error generating ${typeName}:`, error);
    await interaction.editReply(
      `❌ Error generating ${typeName}. ${error.message}`
    );
    throw error;
  }
}
