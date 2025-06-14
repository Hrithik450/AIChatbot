import { ModelService } from "@/actions/model/model.service";
import { createVoiceContentSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const validatedFields = createVoiceContentSchema.parse(data);

  if (!validatedFields) {
    return NextResponse.json({ error: "Please provide a text" });
  }

  try {
    const response = await ModelService.createVoiceContent({
      text: validatedFields.text,
    });

    return new NextResponse(response.data, {
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
