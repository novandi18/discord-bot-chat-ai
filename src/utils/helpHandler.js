import { EmbedBuilder } from "discord.js";

export function createHelpEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("📖 AI Bot Help")
    .setDescription("Here's how to use the AI Bot with all available features:")
    .addFields(
      {
        name: "🛠️ Main Commands",
        value: [
          "**/ai** - Generate text, images, videos, or edit an image with AI. Choose your model and enter a prompt. (Upload an image when using the image-edit model.)",
          "**/queue** - Check the current media processing queue and your position.",
          "**/help** - Show this help message again (ephemeral).",
          "**/reset** - Delete all guild slash commands.",
          "**/reload** - Re-register all guild slash commands.",
        ].join("\n"),
      },
      {
        name: "🤖 Available Models",
        value: [
          "- **GPT-4o** (OpenAI) — advanced conversational text.",
          "- **Gemini 2.5 Flash** (Google) — fast text generation.",
          "- **Gemini 2.5 Pro** (Google) — high-quality text for complex prompts.",
          "- **Gemini 2.0 Flash Image Generation** (Google) — edit your uploaded images.",
          "- **Imagen 3** (Google) — generate images from prompts.",
          "- **Veo 2** (Google) — generate short videos from prompts.",
        ].join("\n"),
      },
      {
        name: "📋 How to Use `/ai`",
        value: [
          "1. Type `/ai` and select your **model**.",
          "2. Enter your **prompt** describing what you want.",
          "3. If you selected **Gemini Image Edit**, upload your image in the **image** option.",
          "4. Submit and wait—the bot will show your queue position.",
          "5. The result will appear as follow-up messages when ready.",
        ].join("\n"),
      },
      {
        name: "⏱️ Estimated Processing Times",
        value: [
          "- **Text**: a few seconds",
          "- **Image gen & edit**: ~30-60 seconds (queued)",
          "- **Video gen**: ~2-5 minutes (queued)",
          "",
          "Use `/queue` at any time to see your position.",
        ].join("\n"),
      },
      {
        name: "💡 Tips for Better Prompts",
        value: [
          "- Be specific: e.g. “Add dramatic lighting.”",
          "- For edits: describe exactly what to change.",
          "- Avoid vague requests like “Make it cool.”",
        ].join("\n"),
      }
    )
    .setFooter({ text: "Zen AI • Novandi Ramadhan" })
    .setTimestamp();

  return embed;
}

export async function handleHelpCommand(interaction) {
  try {
    const helpEmbed = createHelpEmbed();
    await interaction.reply({
      embeds: [helpEmbed],
      ephemeral: true,
    });
  } catch (error) {
    console.error("❌ Error sending help message:", error);
    if (!interaction.replied) {
      await interaction.reply({
        content: "An error occurred while displaying help information.",
        ephemeral: true,
      });
    }
  }
}
