import OpenAI from "openai";
import { OPENAI_API_KEY, OPENAI_MODEL } from "../config.js";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const getGptResponse = async (message) => {
  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: message }],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error fetching GPT response:", error);
    throw error;
  }
};
