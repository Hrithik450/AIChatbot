import { ModelService } from "@/actions/model/model.service";
import { createContentSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const validatedFields = createContentSchema.parse(data);

  if (!validatedFields) {
    return NextResponse.json({ error: "Please provide a user prompt" });
  }

  const { message, systemPrompt, chatId } = validatedFields;
  try {
    const response = await ModelService.createContent({
      message,
      systemPrompt,
      chatId,
    });

    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.log("Open API Error", error);
    return NextResponse.json({ error: "Error processing the request!" });
  }
}
