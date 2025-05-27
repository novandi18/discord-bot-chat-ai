class Queue {
  constructor(name, delay = 5000) {
    this.name = name;
    this.queue = [];
    this.isProcessing = false;
    this.delay = delay;
  }

  async addToQueue(interaction, prompt, type = "video") {
    const queueItem = {
      interaction,
      prompt,
      type,
      timestamp: Date.now(),
    };

    this.queue.push(queueItem);
    const position = this.queue.length;

    const emoji = type === "video" ? "🎬" : "🎨";
    const typeText = type === "video" ? "video generation" : "image generation";

    await interaction.editReply(
      `${emoji} Added to ${typeText} queue. Position: ${position}`
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
    const { interaction, prompt, type } = this.queue.shift();

    try {
      const emoji = type === "video" ? "🎬" : "🎨";
      const typeText = type === "video" ? "video" : "image";

      // Update status
      await interaction.editReply(
        `${emoji} Your ${typeText} is now being generated, this may take a few minutes...`
      );

      let filePaths;
      if (type === "video") {
        const { generateVeo } = await import("../google/veoHandler.js");
        filePaths = await generateVeo(prompt);
      } else if (type === "image") {
        const { generateImagen3 } = await import("../google/imagenHandler.js");
        filePaths = await generateImagen3(prompt);
      }

      if (filePaths && filePaths.length > 0) {
        const successText =
          type === "video" ? "Here is your video:" : "Here is your image:";
        await interaction.editReply({
          content: successText,
          files: [filePaths[0]],
        });
        for (let i = 1; i < filePaths.length; i++) {
          await interaction.followUp({ files: [filePaths[i]] });
        }
      } else {
        await interaction.editReply(
          `${
            typeText.charAt(0).toUpperCase() + typeText.slice(1)
          } generated, but no file found.`
        );
      }
    } catch (err) {
      console.error(`Error generating ${type}:`, err);
      await interaction.editReply(
        `An error occurred while generating the ${type}.`
      );
    }

    // Update posisi antrian untuk semua yang masih menunggu
    this.updateQueuePositions();

    // Proses item berikutnya setelah delay
    setTimeout(() => {
      this.processQueue();
    }, this.delay);
  }

  async updateQueuePositions() {
    for (let i = 0; i < this.queue.length; i++) {
      const { interaction, type } = this.queue[i];
      try {
        const emoji = type === "video" ? "🎬" : "🎨";
        const typeText =
          type === "video" ? "video generation" : "image generation";
        await interaction.editReply(
          `${emoji} In queue for ${typeText}. Position: ${i + 1}`
        );
      } catch (err) {
        // Interaction mungkin sudah expired, hapus dari queue
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
    return { total: this.queue.length, video: videoCount, image: imageCount };
  }
}

// Export instances untuk video dan image queue
export const mediaQueue = new Queue("media", 3000); // 3 detik delay untuk image, 5 detik untuk video akan di-override
