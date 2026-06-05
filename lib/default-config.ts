import type { PuzzleConfig } from "./types";

export const DEFAULT_CONFIG: PuzzleConfig = {
  groups: [
    { name: "Group 1", code: "1111", word: "HEAD" },
    { name: "Group 2", code: "2222", word: "TO" },
    { name: "Group 3", code: "3333", word: "THE" },
    { name: "Group 4", code: "4444", word: "CANTEEN" },
  ],
  finalMessage: "Head to the Canteen!",
};
