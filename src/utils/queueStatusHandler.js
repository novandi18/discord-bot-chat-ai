import { mediaQueue } from "./queueHandler.js";

export async function handleQueueCommand(interaction) {
  const queueInfo = mediaQueue.getQueueInfo();
  await interaction.reply(
    `**Generation Queue Status**\n` +
      `Videos waiting: ${queueInfo.video}\n` +
      `Images waiting: ${queueInfo.image}\n` +
      `Total: ${queueInfo.total}`
  );
}
