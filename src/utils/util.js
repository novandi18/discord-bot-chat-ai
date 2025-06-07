import fs from "node:fs";
import path from "node:path";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";

export function splitMessage(text, maxLength = 2000) {
  const parts = [];
  let current = 0;
  while (current < text.length) {
    parts.push(text.slice(current, current + maxLength));
    current += maxLength;
  }
  return parts;
}

function ensureDownloadsFolder() {
  const downloadsDir = path.resolve("./downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  return downloadsDir;
}

export async function downloadImageToLocal(url, name) {
  const downloadsDir = ensureDownloadsFolder();

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to download image: ${res.status} ${res.statusText}`
    );
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = path.join(downloadsDir, name);
  await fs.promises.writeFile(filePath, buffer);

  return filePath;
}

export async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFilename: path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}
