import { EmbedBuilder } from "discord.js";

export function createHelpEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("📖 AI Bot Help")
    .setDescription(
      "Your ultimate guide to using the Smart Discord Chat AI Bot."
    )
    .addFields(
      {
        name: "🛠️ Main Commands",
        value: [
          "`/chat`       - Chat with text models (GPT-4o, Gemini 2.5 Flash/Pro)",
          "`/video`      - Generate videos (Veo 2) **automatically queued**",
          "`/image`      - Generate images (Imagen 3) **automatically queued**",
          "`/edit_image` - Edit images (Gemini 2.0 Flash) **automatically queued**",
          "`/queue`      - Check the media generation queue",
          "`/help`       - Display this help message",
          "`/reset`      - Remove all slash commands (admin)",
          "`/reload`     - Re-register all slash commands (admin)",
        ].join("\n"),
      },
      {
        name: "🤖 Chat Models",
        value: [
          "- GPT-4o (OpenAI): Advanced conversational AI",
          "- Gemini 2.5 Flash (Google): Fast and efficient text generation",
          "- Gemini 2.5 Pro (Google): High-quality text generation for complex tasks",
        ].join("\n"),
      },
      {
        name: "🎞️ Video Generation",
        value:
          "The **Veo 2** model creates stunning videos based on your prompt. " +
          "You can generate up to **5 videos per day**. Requests are automatically queued for processing.",
      },
      {
        name: "🖼️ Image Generation",
        value:
          "The **Imagen 3** model generates beautiful images from your prompt. " +
          "Requests are automatically queued for processing.",
      },
      {
        name: "✂️ Image Editing",
        value:
          "The **Gemini 2.0 Flash** model edits your uploaded images based on your instructions. " +
          "Requests are automatically queued for processing.",
      },
      {
        name: "📋 How to Use",
        value: [
          "1. Choose the appropriate command (`/chat`, `/video`, `/image`, or `/edit_image`).",
          "2. Enter your prompt in the provided field.",
          "3. For `/edit_image`, upload an image (PNG/JPG/JPEG/WebP) and specify the editing instructions.",
          "4. Submit your request and wait for the bot to process it (your queue position will be displayed).",
          "5. The result will be sent as a follow-up message.",
        ].join("\n"),
      },
      {
        name: "⏱️ Estimated Processing Time",
        value: [
          "- Text models: a few seconds",
          "- Image generation: 30-60 seconds",
          "- Image editing: 30-60 seconds",
          "- Video generation: 2-5 minutes (depending on queue length)",
          "",
          "Use `/queue` to check your position in the queue.",
        ].join("\n"),
      },
      {
        name: "💡 Prompt Tips",
        value: [
          "- Be specific: “Add a sunset background.”",
          "- For editing, describe the changes you want in detail.",
          "- Avoid overly generic prompts: “Make it better.”",
        ].join("\n"),
      }
    )
    .setFooter({ text: "Smart Discord Chat AI • Novandi Ramadhan" })
    .setTimestamp();

  return embed;
}

export async function handleHelpCommand(interaction) {
  try {
    const helpEmbed = createHelpEmbed();
    await interaction.reply({
      embeds: [helpEmbed],
      flags: 64, // ephemeral
    });
  } catch (error) {
    console.error("❌ Error sending help message:", error);
    try {
      if (!interaction.replied) {
        await interaction.reply({
          content: "An error occurred while displaying help information.",
          flags: 64, // ephemeral
        });
      }
    } catch (replyError) {
      console.error("❌ Error sending error reply:", replyError);
    }
  }
}
