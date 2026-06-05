import { NextResponse } from "next/server";
import { readAppState } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await readAppState();
    return NextResponse.json({
      config: state.config,
      unlocks: state.unlocks,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load state" },
      { status: 500 }
    );
  }
}
