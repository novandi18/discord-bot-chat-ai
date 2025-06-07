import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { AZURE_SD3_ENDPOINT, AZURE_SD3_API_KEY } from "../config.js";

export async function generateSD3Image(prompt, aspectRatio = "1:1") {
  const url = `${AZURE_SD3_ENDPOINT}/images/generations`;

  const body = {
    prompt,
    size: "1024x1024",
    output_format: "png",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AZURE_SD3_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Azure SD3 error: ${errText}`);
  }

  const json = await res.json();
  console.log("Azure SD3 response keys:", Object.keys(json));

  let filePaths = [];
  if (json.image) {
    const imagesDir = path.resolve("./images");
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    const buffer = Buffer.from(json.image, "base64");
    const filePath = path.join(imagesDir, `sd3-${Date.now()}.png`);
    fs.writeFileSync(filePath, buffer);
    filePaths.push(filePath);
  } else {
    throw new Error("No image generated.");
  }

  return filePaths;
}
