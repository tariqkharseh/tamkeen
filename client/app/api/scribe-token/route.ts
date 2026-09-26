import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const elevenlabs = new ElevenLabsClient({ apiKey });
    const { token } = await elevenlabs.tokens.singleUse.create("realtime_scribe");
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error creating scribe token:", error);
    return NextResponse.json(
      { error: "Failed to create scribe token", details: String(error) },
      { status: 500 }
    );
  }
}
