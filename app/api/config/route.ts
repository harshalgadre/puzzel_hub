import { NextResponse } from "next/server";
import { readAppState, saveConfig } from "@/lib/storage";
import type { PuzzleConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await readAppState();
    return NextResponse.json(state.config);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load config" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const config = (await request.json()) as PuzzleConfig;
    const state = await saveConfig(config);

    return NextResponse.json({
      config: state.config,
      unlocks: state.unlocks,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save config" },
      { status: 400 }
    );
  }
}
