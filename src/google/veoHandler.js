import { GoogleGenAI } from "@google/genai";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { GEMINI_API_KEY, VEO_MODEL } from "../config.js";
import { Readable } from "stream";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

export async function generateVeo(prompt) {
  const videosDir = path.resolve("./videos");
  if (!existsSync(videosDir)) {
    mkdirSync(videosDir);
  }

  console.log("Starting video generation with prompt:", prompt);

  let operation = await ai.models.generateVideos({
    model: VEO_MODEL,
    prompt: prompt,
    config: {
      personGeneration: "dont_allow",
      aspectRatio: "16:9",
    },
  });

  console.log("Initial operation:", operation);

  while (!operation.done) {
    console.log("Waiting for operation to complete...");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
    console.log("Operation status:", operation.done ? "Done" : "In progress");
  }

  console.log(
    "Final operation response:",
    JSON.stringify(operation.response, null, 2)
  );

  const filePaths = [];
  if (operation.response?.generatedVideos) {
    console.log(
      "Generated videos found:",
      operation.response.generatedVideos.length
    );
    for (let n = 0; n < operation.response.generatedVideos.length; n++) {
      const generatedVideo = operation.response.generatedVideos[n];
      console.log("Processing video", n, "URI:", generatedVideo.video?.uri);

      if (!generatedVideo.video?.uri) {
        console.error("No URI found for video", n);
        continue;
      }

      try {
        const resp = await fetch(
          `${generatedVideo.video.uri}&key=${GEMINI_API_KEY}`
        );

        if (!resp.ok) {
          console.error("Failed to fetch video:", resp.status, resp.statusText);
          continue;
        }

        const filePath = path.join(videosDir, `video${Date.now()}_${n}.mp4`);
        console.log("Saving video to:", filePath);

        const writer = createWriteStream(filePath);
        await new Promise((resolve, reject) => {
          Readable.fromWeb(resp.body).pipe(writer);
          writer.on("finish", () => {
            console.log("Video saved successfully:", filePath);
            resolve();
          });
          writer.on("error", (err) => {
            console.error("Error writing video file:", err);
            reject(err);
          });
        });
        filePaths.push(filePath);
      } catch (error) {
        console.error("Error downloading video", n, ":", error);
      }
    }
  } else {
    console.log("No generated videos in response");
  }

  console.log("Returning file paths:", filePaths);
  return filePaths;
}
