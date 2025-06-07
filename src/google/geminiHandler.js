import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
  Modality,
} from "@google/genai";
import fs from "fs";
import path from "path";
import { GEMINI_API_KEY } from "../config.js";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getGeminiMultimodalResponse(prompt, imagePath, model) {
  let contents;
  if (imagePath) {
    const image = await ai.files.upload({ file: imagePath });
    contents = [
      createUserContent([prompt, createPartFromUri(image.uri, image.mimeType)]),
    ];
  } else {
    contents = [createUserContent([prompt])];
  }

  const response = await ai.models.generateContent({
    model,
    contents,
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  let text = "";
  for (const part of parts) {
    if (part.text) text += part.text;
  }
  return { text, images: [] };
}
