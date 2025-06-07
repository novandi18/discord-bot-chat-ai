import { mediaQueue } from "./queue/index.js";

export async function handleQueueCommand(interaction) {
  const queueInfo = mediaQueue.getQueueInfo();
  await interaction.reply(
    `**Generation Queue Status**\n` +
      `Videos waiting: ${queueInfo.video}\n` +
      `Images waiting: ${queueInfo.imagen3 + queueInfo.imagen4}\n` +
      `Edits waiting: ${queueInfo.edit}\n` +
      `Total: ${queueInfo.total}`
  );
}
