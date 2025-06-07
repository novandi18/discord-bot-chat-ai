import fetch from "node-fetch";
import { getAccessToken } from "../utils/util.js";

const PROJECT_ID = process.env.GCLOUD_PROJECT_ID;
const LOCATION = process.env.GCP_REGION;

export async function generateImagen4(
  promptText,
  sampleCount = 1,
  model,
  aspectRatio = "1:1"
) {
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}:predict`;
  const token = await getAccessToken();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      instances: [{ prompt: promptText }],
      parameters: {
        sampleCount,
        aspectRatio,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Imagen4 error: ${errText}`);
  }

  const json = await res.json();
  return json.predictions;
}
