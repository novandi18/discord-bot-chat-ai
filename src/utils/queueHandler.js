class Queue {
  constructor(name, delay = 5000) {
    this.name = name;
    this.queue = [];
    this.isProcessing = false;
    this.delay = delay;
  }

  async addToQueue(interaction, data, type) {
    this.queue.push({
      interaction,
      data,
      type,
      timestamp: Date.now(),
    });

    const pos = this.queue.length;
    const emoji =
      type === "video"
        ? "🎬"
        : type === "imagen3" || type === "imagen4"
        ? "🎨"
        : "✏️";

    const text =
      type === "video"
        ? "video generation"
        : type === "imagen3"
        ? "imagen3 generation"
        : type === "imagen4"
        ? "imagen4 generation"
        : "image editing";

    await interaction.editReply(
      `${emoji} Added to ${text} queue. Position: ${pos}`
    );

    if (!this.isProcessing) this.processQueue();
  }

  async processQueue() {
    if (!this.queue.length) {
      this.isProcessing = false;
      return;
    }
    this.isProcessing = true;

    const { interaction, data, type } = this.queue.shift();

    try {
      const emoji =
        type === "video"
          ? "🎬"
          : type === "imagen3" || type === "imagen4"
          ? "🎨"
          : "✏️";

      const text =
        type === "video"
          ? "video"
          : type === "imagen3"
          ? "imagen3 image"
          : type === "imagen4"
          ? "imagen4 image"
          : "edited image";

      await interaction.editReply(`${emoji} Processing your ${text}...`);

      let files;
      if (type === "video") {
        const { generateVeo } = await import("../google/veoHandler.js");
        files = await generateVeo(data.prompt);
      } else if (type === "imagen3") {
        const { generateImagen3 } = await import("../google/imagenHandler.js");
        files = await generateImagen3(data.prompt, data.aspectRatio);
      } else if (type === "imagen4") {
        const { generateImagen4 } = await import("../google/imagen4Handler.js");
        files = await generateImagen4(
          data.prompt,
          data.sampleCount || 1,
          data.model,
          data.aspectRatio
        );
        files = files.map((p, i) => ({
          buffer: Buffer.from(p.bytesBase64Encoded, "base64"),
          name: `image_${i + 1}.${p.mimeType.split("/")[1]}`,
        }));
      } else {
        const { generateGeminiEdit } = await import(
          "../google/geminiImageEditHandler.js"
        );
        files = await generateGeminiEdit(data.prompt, data.tmpPath);
      }

      if (files && files.length) {
        if (type === "imagen4") {
          await interaction.editReply({
            files: [{ attachment: files[0].buffer, name: files[0].name }],
          });
          for (let i = 1; i < files.length; i++)
            await interaction.followUp({
              files: [{ attachment: files[i].buffer, name: files[i].name }],
            });
        } else {
          await interaction.editReply({ files: [files[0]] });
          for (let i = 1; i < files.length; i++)
            await interaction.followUp({ files: [files[i]] });
        }
      } else {
        await interaction.editReply(`❌ No file generated for ${text}.`);
      }
    } catch (e) {
      console.error(`Error generating ${type}:`, e);
      await interaction.editReply(`❌ Error generating ${type}.`);
    }
    this.updateQueuePositions();
    setTimeout(() => this.processQueue(), this.delay);
  }

  async updateQueuePositions() {
    for (let i = 0; i < this.queue.length; i++) {
      const { interaction, type } = this.queue[i];
      const emoji =
        type === "video"
          ? "🎬"
          : type === "imagen3" || type === "imagen4"
          ? "🎨"
          : "✏️";
      const text =
        type === "video"
          ? "video generation"
          : type === "imagen3"
          ? "imagen3 generation"
          : type === "imagen4"
          ? "imagen4 generation"
          : "image editing queue";
      try {
        await interaction.editReply(
          `${emoji} In queue for ${text}. Position: ${i + 1}`
        );
      } catch {
        this.queue.splice(i, 1);
        i--;
      }
    }
  }

  getQueueInfo() {
    return {
      total: this.queue.length,
      video: this.queue.filter((i) => i.type === "video").length,
      imagen3: this.queue.filter((i) => i.type === "imagen3").length,
      imagen4: this.queue.filter((i) => i.type === "imagen4").length,
      edit: this.queue.filter((i) => i.type === "edit").length,
    };
  }
}

export const mediaQueue = new Queue("media", 3000);
