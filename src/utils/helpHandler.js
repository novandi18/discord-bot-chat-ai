import { EmbedBuilder } from "discord.js";

export function createHelpEmbed() {
  return new EmbedBuilder()
    .setColor(0x1abc9c)
    .setTitle("🚀 Zen AI Bot — Your Creative Companion")
    .setDescription(
      "Ready to explore the power of AI? Here's everything you need to know:"
    )
    .addFields(
      {
        name: "⚙️ Core Commands",
        value: [
          "**/chat** — Spark a conversation or get creative text from GPT-4o or Gemini.",
          "**/image** — Generate original images with Imagen 3 & 4 (choose your aspect ratio!).",
          "**/video** — Craft short videos using Veo 2. Just pick a prompt and watch it unfold.",
          "**/image_edit** — Upload an image and describe the tweaks. Gemini will handle the rest.",
        ].join("\n"),
      },
      {
        name: "🔧 Utility Commands",
        value: [
          "**/queue** — See where you are in the media generation queue.",
          "**/help** — Bring up this guide anytime (only you can see it).",
          "**/reset** — Remove all slash commands from this server.",
          "**/reload** — Re-register all slash commands after updates.",
        ].join("\n"),
      },
      {
        name: "🤖 AI Models at a Glance",
        value: [
          "- **GPT-4o**: Conversational and creative text generation (OpenAI).",
          "- **Gemini 2.5 Flash & Pro**: Fast or high-quality text (Google).",
          "- **Imagen 3, 4 Standard & Ultra**: Stunning still images (Google).",
          "- **Veo 2**: Dynamic short videos from text prompts (Google).",
          "- **Gemini 2.0 Flash Image Generation**: Smart edits on your uploaded photos.",
        ].join("\n"),
      },
      {
        name: "⏱️ Estimated Processing Times",
        value: [
          "- **Text**: nearly instant",
          "- **Images & Edits**: ~30-60 seconds (queued)",
          "- **Videos**: ~2-5 minutes (queued)",
          "",
          "Use **/queue** at any time to check your spot!",
        ].join("\n"),
      },
      {
        name: "💡 Pro Tips for Better Prompts",
        value: [
          "- Be descriptive: “Add golden hour lighting” instead of “make it bright.”",
          "- For edits: clearly specify what and where to change.",
          "- Experiment with styles: “in the style of Studio Ghibli,” “futuristic sci-fi,” etc.",
          "- Mention aspect ratio for images if you have a preferred format.",
        ].join("\n"),
      }
    )
    .setFooter({ text: "Zen AI • Novandi Ramadhan" })
    .setTimestamp();
}

export async function handleHelpCommand(interaction) {
  try {
    const helpEmbed = createHelpEmbed();
    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  } catch (error) {
    console.error("❌ Error sending help embed:", error);
    if (!interaction.replied) {
      await interaction.reply({
        content: "😕 Oops! Couldn't display the help menu.",
        ephemeral: true,
      });
    }
  }
}
