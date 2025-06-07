import { AzureOpenAI } from "openai";
import {
  AZURE_API_KEY,
  AZURE_ENDPOINT,
  AZURE_O4_MINI_API_VERSION,
  AZURE_O4_MINI_NAME,
  AZURE_O4_MINI_DEPLOYMENT_NAME,
} from "../config.js";

const o4MiniOptions = {
  endpoint: AZURE_ENDPOINT,
  apiKey: AZURE_API_KEY,
  deployment: AZURE_O4_MINI_DEPLOYMENT_NAME,
  apiVersion: AZURE_O4_MINI_API_VERSION,
};
const o4MiniClient = new AzureOpenAI(o4MiniOptions);

export const getO4MiniResponse = async (message) => {
  try {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: message },
    ];

    const response = await o4MiniClient.chat.completions.create({
      messages,
      max_completion_tokens: 4096,
      model: AZURE_O4_MINI_NAME,
    });

    if (response?.error !== undefined && response.status !== "200") {
      throw response.error;
    }
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error fetching o4-mini response:", error);
    throw error;
  }
};
