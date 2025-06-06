import fs from "node:fs";
import path from "path";

class Queue {
  constructor(name, delay = 5000) {
    this.name = name;
    this.queue = [];
    this.isProcessing = false;
    this.delay = delay;
  }

  async addToQueue(interaction, payload, type = "video") {
    const queueItem = { interaction, payload, type, timestamp: Date.now() };
    this.queue.push(queueItem);
    const position = this.queue.length;

    let emoji, typeText;
    if (type === "video") {
      emoji = "🎬";
      typeText = "video generation";
    } else if (type === "image") {
      emoji = "🖼️";
      typeText = "image generation";
    } else if (type === "gemini-edit") {
      emoji = "✂️";
      typeText = "image edit";
    }

    await interaction.editReply(
      `${emoji} Added to the ${typeText} queue. Position: ${position}`
    );

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const { interaction, payload, type } = this.queue.shift();

    try {
      let successText;
      if (type === "video") {
        const { generateVeo } = await import("../google/veoHandler.js");
        filePaths = await generateVeo(prompt);
      } else if (type === "image") {
        const { generateImagen3 } = await import("../google/imagenHandler.js");
        filePaths = await generateImagen3(prompt);
      } else if (type === "gemini-edit") {
        const { prompt, imagePath } = payload;
        await interaction.editReply(
          "✂️ Gemini is working its magic to edit your image..."
        );

        const { generateGeminiEdit } = await import(
          "../google/geminiImageEditHandler.js"
        );
        const editedFilePaths = await generateGeminiEdit(prompt, imagePath);

        if (editedFilePaths && editedFilePaths.length > 0) {
          successText = "✅ Edited image result:";
          await interaction.editReply({
            content: successText,
            files: [editedFilePaths[0]],
          });
          for (let i = 1; i < editedFilePaths.length; i++) {
            await interaction.followUp({ files: [editedFilePaths[i]] });
          }
        } else {
          await interaction.editReply(
            "⚠️ The image has been edited, but no file was found."
          );
        }

        try {
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        } catch (e) {
          console.warn("⚠️ Failed to delete old local file:", imagePath);
        }
      }
    } catch (err) {
      console.error(`❌ Error while processing ${type}:`, err);
      await interaction.editReply(
        `❌ An error occurred while processing ${type}.`
      );
    }

    await this.updateQueuePositions();

    setTimeout(() => {
      this.processQueue();
    }, this.delay);
  }

  async updateQueuePositions() {
    for (let i = 0; i < this.queue.length; i++) {
      const { interaction, type } = this.queue[i];
      try {
        let emoji, typeText;
        if (type === "video") {
          emoji = "🎬";
          typeText = "video generation";
        } else if (type === "image") {
          emoji = "🖼️";
          typeText = "image generation";
        } else if (type === "gemini-edit") {
          emoji = "✂️";
          typeText = "image edit";
        }
        await interaction.editReply(
          `${emoji} Still waiting in the ${typeText} queue. Position: ${i + 1}`
        );
      } catch (err) {
        this.queue.splice(i, 1);
        i--;
      }
    }
  }

  getQueueLength() {
    return this.queue.length;
  }

  getQueueInfo() {
    const videoCount = this.queue.filter(
      (item) => item.type === "video"
    ).length;
    const imageCount = this.queue.filter(
      (item) => item.type === "image"
    ).length;
    const editCount = this.queue.filter(
      (item) => item.type === "gemini-edit"
    ).length;
    return {
      total: this.queue.length,
      video: videoCount,
      image: imageCount,
      edit: editCount,
    };
  }
}

export const mediaQueue = new Queue("media", 3000);
