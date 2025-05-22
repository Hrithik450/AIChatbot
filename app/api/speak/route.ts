import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text || text === "")
    return NextResponse.json({ error: "Please provide a text" });

  try {
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "ash",
      input: text,
      instructions: "Speak in a cheerful and positive tone.",
    });

    const audioBuffer = Buffer.from(await mp3.arrayBuffer());
    if (!audioBuffer) throw new Error("Server is busy, try again later!");

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="speech.mp3"',
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
