import OpenAI from "openai";
import { GEMINI_API_KEY } from "../config.js";

const openai = new OpenAI({
  apiKey: GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function getGeminiResponse(prompt, model) {
  const response = await openai.chat.completions.create({
    model: model,
    reasoning_effort: "low",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant, answer must be 2000 characters or fewer in length.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0].message.content || "No response from Gemini.";
}
