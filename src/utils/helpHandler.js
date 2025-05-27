import { EmbedBuilder } from "discord.js";

export function createHelpEmbed() {
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle("AI Bot Help")
    .setDescription("Here are the available commands and models:")
    .addFields(
      {
        name: "Commands",
        value: `/ai - Generate content with AI models
/queue - Check generation queue status
/help - Show this help message`,
        inline: false,
      },
      {
        name: "Available AI Models",
        value: `**Text Models:**
• GPT-4o - OpenAI's latest text model
• Gemini 2.5 Flash - Fast Google AI model
• Gemini 2.5 Pro - Advanced Google AI model

**Media Models:**
• Imagen 3 - Generate high-quality images
• Veo 2 - Generate videos (queued processing)`,
        inline: false,
      },
      {
        name: "How to Use",
        value: `1. Type /ai to start
2. Choose your desired model from the dropdown
3. Enter your prompt in the text field
4. Submit and wait for the AI to respond

**Note:** Image and video generation use a queue system to prevent overload.`,
        inline: false,
      },
      {
        name: "Processing Times",
        value: `• Text Models: Few seconds
• Image Generation: 30-60 seconds
• Video Generation: 2-5 minutes

Video and image requests are processed in order through a queue system.`,
        inline: false,
      },
      {
        name: "Tips",
        value: `• Be specific in your prompts for better results
• Use /queue to check your position in the generation queue
• Text responses are automatically split if they exceed Discord's character limit
• All generated media is saved locally on the server`,
        inline: false,
      }
    )
    .setFooter({
      text: "Smart Discord Chat AI • Made by Novandi Ramadhan",
    })
    .setTimestamp();

  return embed;
}

export async function handleHelpCommand(interaction) {
  try {
    const helpEmbed = createHelpEmbed();
    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  } catch (error) {
    console.error("Error sending help message:", error);
    await interaction.reply({
      content: "An error occurred while displaying help information.",
      ephemeral: true,
    });
  }
}
