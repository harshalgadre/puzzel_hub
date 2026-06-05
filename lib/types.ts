export type Group = {
  name: string;
  code: string;
  word: string;
};

export type PuzzleConfig = {
  groups: Group[];
  finalMessage: string;
};

export type AppState = {
  config: PuzzleConfig;
  unlocks: boolean[];
};

export type StateResponse = {
  config: PuzzleConfig;
  unlocks: boolean[];
};
