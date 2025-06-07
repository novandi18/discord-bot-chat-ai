export const QUEUE_TYPES = {
  VIDEO: "video",
  IMAGEN3: "imagen3",
  IMAGEN4: "imagen4",
  EDIT: "edit",
  AZURE_SD3_LARGE: "sd3",
};

export const QUEUE_EMOJIS = {
  [QUEUE_TYPES.VIDEO]: "🎬",
  [QUEUE_TYPES.IMAGEN3]: "🎨",
  [QUEUE_TYPES.IMAGEN4]: "🎨",
  [QUEUE_TYPES.EDIT]: "✏️",
  [QUEUE_TYPES.AZURE_SD3_LARGE]: "🎨",
};

export const QUEUE_TYPE_NAMES = {
  [QUEUE_TYPES.VIDEO]: "Veo 2 video",
  [QUEUE_TYPES.IMAGEN3]: "Imagen 3 image",
  [QUEUE_TYPES.IMAGEN4]: "Imagen 4 image",
  [QUEUE_TYPES.EDIT]: "Gemini Image Generation image",
  [QUEUE_TYPES.AZURE_SD3_LARGE]: "Stable Diffusion 3 Large image",
};
