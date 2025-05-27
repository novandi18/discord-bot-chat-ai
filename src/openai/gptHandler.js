import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config.js";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const getGptResponse = async (message, model) => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant, answer must be 2000 characters or fewer in length.",
        },
        { role: "user", content: message },
      ],
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error fetching GPT response:", error);
    throw error;
  }
};
