import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../config.js";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getGeminiResponse(prompt) {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });
  return response.text;
}
