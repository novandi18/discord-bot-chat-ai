import { EmbedBuilder } from "discord.js";

export function createHelpEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("AI Bot Help")
    .setDescription("Guide for using this Discord AI bot.")
    .addFields(
      {
        name: "Main Commands",
        value: [
          "`/ai` - Generate content with AI models (text, image, or video)",
          "`/queue` - View the current image/video generation queue",
          "`/help` - Show this help message",
          "`/reset` - Delete all slash commands (admin)",
          "`/reload` - Re-register all slash commands (admin)",
        ].join("\n"),
        inline: false,
      },
      {
        name: "Available AI Models",
        value: [
          "**Text Models:**",
          "- GPT-4o (OpenAI)",
          "- Gemini 2.5 Flash (Google)",
          "- Gemini 2.5 Pro (Google)",
          "",
          "**Media Models:**",
          "- Imagen 3 (Image, Google)",
          "- Veo 2 (Video, Google, automatic queue)",
        ].join("\n"),
        inline: false,
      },
      {
        name: "How to Use",
        value: [
          "1. Type `/ai` and select the desired AI model.",
          "2. Enter your prompt or instruction.",
          "3. Submit and wait for the AI to respond.",
          "",
          "For image/video generation, your request will be automatically queued and processed one by one.",
        ].join("\n"),
        inline: false,
      },
      {
        name: "Estimated Processing Time",
        value: [
          "- Text models: a few seconds",
          "- Image generation: 30-60 seconds",
          "- Video generation: 2-5 minutes (depending on queue)",
          "",
          "Use `/queue` to check your position in the queue.",
        ].join("\n"),
        inline: false,
      },
      {
        name: "Usage Tips",
        value: [
          "- Use clear and specific prompts for best results.",
          "- Text responses are automatically split if they exceed 2000 characters.",
          "- All generated media is saved on the server.",
          "- If you encounter an error, please try again later.",
        ].join("\n"),
        inline: false,
      }
    )
    .setFooter({
      text: "Smart Discord Chat AI • Novandi Ramadhan",
    })
    .setTimestamp();

  return embed;
}

export async function handleHelpCommand(interaction) {
  try {
    const helpEmbed = createHelpEmbed();
    await interaction.reply({
      embeds: [helpEmbed],
      flags: 64, // Gunakan flags: 64 untuk ephemeral, bukan ephemeral: true
    });
  } catch (error) {
    console.error("❌ Error sending help message:", error);
    try {
      if (!interaction.replied) {
        await interaction.reply({
          content: "An error occurred while displaying help information.",
          flags: 64,
        });
      }
    } catch (replyError) {
      console.error("❌ Error sending error reply:", replyError);
    }
  }
}
