import { textCommands } from "./textCommands.js";
import { imageCommands } from "./imageCommands.js";
import { videoCommands } from "./videoCommands.js";
import { imageEditCommands } from "./imageEditCommands.js";
import { utilityCommands } from "./utilityCommands.js";

export const commandDefinitions = [
  ...textCommands.definitions,
  ...imageCommands.definitions,
  ...videoCommands.definitions,
  ...imageEditCommands.definitions,
  ...utilityCommands.definitions,
];

export const commandHandlers = {
  ...textCommands.handlers,
  ...imageCommands.handlers,
  ...videoCommands.handlers,
  ...imageEditCommands.handlers,
  ...utilityCommands.handlers,
};
