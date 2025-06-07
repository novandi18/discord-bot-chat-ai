import { QueueBase } from "./QueueBase.js";
import { processQueueItem } from "./queueProcessor.js";
import { QUEUE_TYPES, QUEUE_EMOJIS } from "../../constants/QueueTypes.js";

export class MediaQueue extends QueueBase {
  async addToQueue(interaction, data, type) {
    if (!Object.values(QUEUE_TYPES).includes(type)) {
      throw new Error(`Invalid queue type: ${type}`);
    }

    const position = this.add({
      interaction,
      data,
      type,
    });

    const emoji = QUEUE_EMOJIS[type] || "⏳";
    const typeText = this.getTypeText(type);

    try {
      await interaction.editReply(
        `${emoji} Added to ${typeText} queue. Position: ${position}`
      );
    } catch (error) {
      console.error("Failed to update queue position:", error);
      this.queue = this.queue.filter(
        (item) => item.interaction.id !== interaction.id
      );
    }

    return position;
  }

  getTypeText(type) {
    switch (type) {
      case QUEUE_TYPES.VIDEO:
        return "video generation";
      case QUEUE_TYPES.IMAGEN3:
        return "imagen3 generation";
      case QUEUE_TYPES.IMAGEN4:
        return "imagen4 generation";
      case QUEUE_TYPES.EDIT:
        return "image editing";
      default:
        return "media generation";
    }
  }

  async processNext() {
    if (!this.queue.length) return;

    const item = this.queue.shift();

    const { interaction, type } = item;
    if (type === "imagen3" || type === "imagen4") {
      try {
        await interaction.editReply("🖼️ Generating image...");
      } catch (err) {
        console.error("Failed to update image generation status:", err);
      }
    } else if (type === "edit") {
      try {
        await interaction.editReply("🖌️ Editing image...");
      } catch (err) {
        console.error("Failed to update image editing status:", err);
      }
    } else if (type === "video") {
      try {
        await interaction.editReply("🎬 Creating video...");
      } catch (err) {
        console.error("Failed to update video creation status:", err);
      }
    }

    await processQueueItem(item);
    await this.updateQueuePositions();
  }

  async updateQueuePositions() {
    for (let i = 0; i < this.queue.length; i++) {
      const { interaction, type } = this.queue[i];
      const emoji = QUEUE_EMOJIS[type] || "⏳";
      const typeText = this.getTypeText(type);

      try {
        await interaction.editReply(
          `${emoji} In queue for ${typeText}. Position: ${i + 1}`
        );
      } catch (error) {
        console.error("Failed to update queue position:", error);
        this.queue.splice(i, 1);
        i--;
      }
    }
  }

  getQueueInfo() {
    return {
      total: this.queue.length,
      video: this.queue.filter((i) => i.type === QUEUE_TYPES.VIDEO).length,
      imagen3: this.queue.filter((i) => i.type === QUEUE_TYPES.IMAGEN3).length,
      imagen4: this.queue.filter((i) => i.type === QUEUE_TYPES.IMAGEN4).length,
      edit: this.queue.filter((i) => i.type === QUEUE_TYPES.EDIT).length,
    };
  }
}
