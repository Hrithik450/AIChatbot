import OpenAI from "openai";
import {
  createContentSchema,
  createVoiceContentSchema,
  TCreateContentSchema,
  TCreateVoiceContentSchema,
} from "@/lib/validations";

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

export class ModelService {
  static async createContent(data: TCreateContentSchema) {
    try {
      const validatedData = createContentSchema.parse(data);

      const { message, systemPrompt } = validatedData;
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error("Server is busy, try again later!");

      return {
        success: true,
        data: JSON.parse(content),
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to generate content",
      };
    }
  }

  static async createVoiceContent(data: TCreateVoiceContentSchema) {
    try {
      const validatedData = createVoiceContentSchema.parse(data);

      const { text } = validatedData;
      const mp3 = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "ash",
        input: text,
        instructions: "Speak in a cheerful and positive tone.",
      });

      const audioBuffer = Buffer.from(await mp3.arrayBuffer());
      if (!audioBuffer) throw new Error("Server is busy, try again later!");

      return {
        success: true,
        data: audioBuffer,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate voice content",
      };
    }
  }
}
