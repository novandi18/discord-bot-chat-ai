export const TextModels = [
  { name: "GPT-4o", value: process.env.AZURE_GPT_4O_NAME },
  { name: "Gemini 2.5 Flash", value: process.env.GEMINI_FLASH_MODEL },
  { name: "Gemini 2.5 Pro", value: process.env.GEMINI_PRO_MODEL },
  { name: "o4-mini", value: process.env.AZURE_O4_MINI_NAME },
];

export const VideoModels = [{ name: "Veo 2", value: process.env.VEO_MODEL }];

export const ImageModels = [
  { name: "Imagen 3", value: process.env.IMAGEN_3_MODEL },
  { name: "Imagen 4 Standard", value: process.env.IMAGEN_4_STANDARD_MODEL },
  { name: "Imagen 4 Ultra", value: process.env.IMAGEN_4_ULTRA_MODEL },
];

export const ImageEditingModels = [
  { name: "Gemini Image Edit", value: process.env.GEMINI_IMAGE_EDIT_MODEL },
];

export const AspectRatios = [
  { name: "1:1 (square)", value: "1:1" },
  { name: "9:16 (portrait)", value: "9:16" },
  { name: "16:9 (landscape)", value: "16:9" },
  { name: "3:4", value: "3:4" },
  { name: "4:3", value: "4:3" },
];
