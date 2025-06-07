import { processVideo } from "../processors/videoProcessor.js";
import { processImagen3 } from "../processors/imagen3Processor.js";
import { processImagen4 } from "../processors/imagen4Processor.js";
import { processImageEdit } from "../processors/imageEditProcessor.js";
import { processSD3Large } from "../processors/sd3Processor.js";
import { QUEUE_TYPES } from "../../constants/QueueTypes.js";

export {
  processVideo,
  processImagen3,
  processImagen4,
  processImageEdit,
  processSD3Large,
};

export async function processQueueItem(item) {
  const { interaction, data, type } = item;

  try {
    switch (type) {
      case QUEUE_TYPES.VIDEO:
        return await processVideo(interaction, data);
      case QUEUE_TYPES.IMAGEN3:
        return await processImagen3(interaction, data);
      case QUEUE_TYPES.IMAGEN4:
        return await processImagen4(interaction, data);
      case QUEUE_TYPES.EDIT:
        return await processImageEdit(interaction, data);
      case QUEUE_TYPES.AZURE_SD3_LARGE:
        return await processSD3Large(interaction, data);
      default:
        throw new Error(`Unknown queue type: ${type}`);
    }
  } catch (error) {
    console.error(`Error processing ${type}:`, error);
    try {
      await interaction.editReply(`❌ Error generating ${type}.`);
    } catch (replyError) {
      console.error("Failed to send error reply:", replyError);
    }
  }
}
