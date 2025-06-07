import { AzureOpenAI } from "openai";
import {
  AZURE_API_KEY,
  AZURE_ENDPOINT,
  AZURE_GPT_4O_DEPLOYMENT_NAME,
  AZURE_API_VERSION,
  AZURE_GPT_4O_NAME,
} from "../config.js";

const endpoint = AZURE_ENDPOINT;
const deployment = AZURE_GPT_4O_DEPLOYMENT_NAME;
const apiKey = AZURE_API_KEY;
const apiVersion = AZURE_API_VERSION;
const modelName = AZURE_GPT_4O_NAME;

const options = { endpoint, apiKey, deployment, apiVersion };
const client = new AzureOpenAI(options);

export const getGptResponse = async (message, model, imageUrl = null) => {
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant, answer must be 2000 characters or fewer in length.",
      },
      {
        role: "user",
        content: imageUrl
          ? [
              { type: "text", text: message },
              { type: "image_url", image_url: { url: imageUrl } },
            ]
          : message,
      },
    ];

    const response = await client.chat.completions.create({
      messages,
      max_tokens: 4096,
      temperature: 1,
      top_p: 1,
      model: modelName,
    });

    if (response?.error !== undefined && response.status !== "200") {
      throw response.error;
    }
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error fetching GPT response:", error);
    throw error;
  }
};
