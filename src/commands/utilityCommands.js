import { SlashCommandBuilder } from "discord.js";
import { handleHelpCommand } from "../utils/helpHandler.js";
import { handleQueueCommand } from "../utils/queueStatusHandler.js";
import {
  handleResetCommands,
  handleReloadCommands,
} from "../utils/reloadHandler.js";

export const utilityCommands = {
  definitions: [
    new SlashCommandBuilder()
      .setName("queue")
      .setDescription("Check generation queue status")
      .toJSON(),

    new SlashCommandBuilder()
      .setName("help")
      .setDescription("Show bot commands and usage information")
      .toJSON(),

    new SlashCommandBuilder()
      .setName("reset")
      .setDescription("Reset (delete) all guild slash commands")
      .toJSON(),

    new SlashCommandBuilder()
      .setName("reload")
      .setDescription("Reload (register) all guild slash commands")
      .toJSON(),
  ],

  handlers: {
    async queue(interaction) {
      await handleQueueCommand(interaction);
    },

    async help(interaction) {
      await handleHelpCommand(interaction);
    },

    async reset(interaction) {
      await handleResetCommands(interaction);
    },

    async reload(interaction) {
      await handleReloadCommands(interaction);
    },
  },
};
