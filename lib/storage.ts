import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_CONFIG } from "./default-config";
import type { AppState, PuzzleConfig } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

function defaultState(): AppState {
  return {
    config: structuredClone(DEFAULT_CONFIG),
    unlocks: new Array(DEFAULT_CONFIG.groups.length).fill(false),
  };
}

async function ensureDataFile(): Promise<AppState> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    const raw = await fs.readFile(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AppState;

    if (
      parsed?.config?.groups &&
      Array.isArray(parsed.config.groups) &&
      typeof parsed.config.finalMessage === "string" &&
      Array.isArray(parsed.unlocks)
    ) {
      if (parsed.unlocks.length !== parsed.config.groups.length) {
        const newUnlocks = new Array(parsed.config.groups.length).fill(false);
        for (
          let i = 0;
          i < Math.min(parsed.unlocks.length, newUnlocks.length);
          i++
        ) {
          if (parsed.unlocks[i]) newUnlocks[i] = true;
        }
        parsed.unlocks = newUnlocks;
        await writeState(parsed);
      }
      return parsed;
    }
  } catch {
    // file missing or invalid — create default
  }

  const initial = defaultState();
  await writeState(initial);
  return initial;
}

async function writeState(state: AppState): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

export async function readAppState(): Promise<AppState> {
  return ensureDataFile();
}

export async function saveUnlocks(unlocks: boolean[]): Promise<AppState> {
  const state = await ensureDataFile();
  if (unlocks.length !== state.config.groups.length) {
    throw new Error("Unlock array length mismatch");
  }
  state.unlocks = unlocks;
  await writeState(state);
  return state;
}

export async function unlockGroup(index: number, code: string): Promise<{
  success: boolean;
  state: AppState;
}> {
  const state = await ensureDataFile();
  const group = state.config.groups[index];

  if (!group || state.unlocks[index]) {
    return { success: false, state };
  }

  if (code.trim() !== group.code) {
    return { success: false, state };
  }

  state.unlocks[index] = true;
  await writeState(state);
  return { success: true, state };
}

export async function saveConfig(config: PuzzleConfig): Promise<AppState> {
  const state = await ensureDataFile();

  if (!config.groups?.length || !config.finalMessage?.trim()) {
    throw new Error("Invalid config");
  }

  for (const group of config.groups) {
    if (!group.name?.trim() || !group.code?.trim() || !group.word?.trim()) {
      throw new Error("Each group needs name, code, and word");
    }
  }

  const newUnlocks = new Array(config.groups.length).fill(false);
  for (let i = 0; i < Math.min(state.unlocks.length, newUnlocks.length); i++) {
    if (state.unlocks[i]) newUnlocks[i] = true;
  }

  state.config = config;
  state.unlocks = newUnlocks;
  await writeState(state);
  return state;
}

export async function resetUnlocks(): Promise<AppState> {
  const state = await ensureDataFile();
  state.unlocks = new Array(state.config.groups.length).fill(false);
  await writeState(state);
  return state;
}
