import { NextResponse } from "next/server";
import { resetUnlocks } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const state = await resetUnlocks();
    return NextResponse.json({
      unlocks: state.unlocks,
      config: state.config,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to reset progress" },
      { status: 500 }
    );
  }
}
