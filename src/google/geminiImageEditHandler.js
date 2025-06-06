import fs from "node:fs";
import path from "path";
import { GoogleGenAI, Modality } from "@google/genai";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_IMAGE_EDIT_MODEL;

const ai = new GoogleGenAI({ apiKey });

export async function generateGeminiEdit(promptText, localImagePath) {
  let mimeType = "image/png";
  if (
    localImagePath.toLowerCase().endsWith(".jpg") ||
    localImagePath.toLowerCase().endsWith(".jpeg")
  ) {
    mimeType = "image/jpeg";
  }
  const imageBuffer = fs.readFileSync(localImagePath);
  const base64Image = imageBuffer.toString("base64");

  const contents = [
    { text: promptText },
    { inlineData: { mimeType, data: base64Image } },
  ];

  let response;
  try {
    response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
  } catch (err) {
    console.error("❌ Error saat memanggil Gemini Image Edit:", err);
    throw err;
  }

  const outputsDir = "../outputs";
  if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
  }

  const savedPaths = [];
  const parts = response.candidates[0].content.parts;
  for (const part of parts) {
    if (part.inlineData) {
      const outBase64 = part.inlineData.data;
      const timestamp = Date.now();
      const ext = mimeType === "image/png" ? "png" : "jpg";
      const outFilename = `gemini_edit_${timestamp}.${ext}`;
      const outPath = path.join(outputsDir, outFilename);
      const buffer = Buffer.from(outBase64, "base64");
      fs.writeFileSync(outPath, buffer);
      savedPaths.push(outPath);
    }
  }

  return savedPaths;
}
