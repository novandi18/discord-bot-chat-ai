import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import fs from "fs";
import { GEMINI_API_KEY } from "../config.js";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getGeminiMultimodalResponse(
  prompt,
  imagePath,
  model,
  pdfPath = null
) {
  const parts = [prompt];

  if (imagePath) {
    const image = await ai.files.upload({ file: imagePath });
    parts.push(createPartFromUri(image.uri, image.mimeType));
  }

  if (pdfPath) {
    const pdfBuffer = fs.readFileSync(pdfPath);
    parts.push({
      inlineData: {
        mimeType: "application/pdf",
        data: pdfBuffer.toString("base64"),
      },
    });
  }

  const contents = [createUserContent(parts)];

  const response = await ai.models.generateContent({
    model,
    contents,
  });

  const respParts = response.candidates?.[0]?.content?.parts || [];
  let text = "";
  for (const part of respParts) {
    if (part.text) text += part.text;
  }
  return text;
}
