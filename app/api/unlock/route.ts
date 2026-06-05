import { NextResponse } from "next/server";
import { unlockGroup } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { index?: number; code?: string };

    if (
      typeof body.index !== "number" ||
      typeof body.code !== "string"
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const result = await unlockGroup(body.index, body.code);

    return NextResponse.json({
      success: result.success,
      unlocks: result.state.unlocks,
      config: result.state.config,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to unlock group" },
      { status: 500 }
    );
  }
}
