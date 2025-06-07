import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, IMAGEN_3_MODEL } from "../config.js";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateImagen3(prompt, aspectRatio) {
  const imagesDir = path.resolve("./images");
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }

  const response = await ai.models.generateImages({
    model: IMAGEN_3_MODEL,
    prompt: prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: aspectRatio,
    },
  });

  let idx = 1;
  const filePaths = [];
  for (const generatedImage of response.generatedImages) {
    let imgBytes = generatedImage.image.imageBytes;
    const buffer = Buffer.from(imgBytes, "base64");
    const filePath = path.join(imagesDir, `imagen-${Date.now()}-${idx}.png`);
    fs.writeFileSync(filePath, buffer);
    filePaths.push(filePath);
    idx++;
  }
  return filePaths;
}
