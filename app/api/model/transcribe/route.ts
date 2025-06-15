import { IncomingForm } from "formidable";
import fs from "fs";
import { OpenAI } from "openai";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY! });

async function createNodeRequest(
  req: Request
): Promise<Readable & { headers: any }> {
  const reader = req.body?.getReader();
  if (!reader) throw new Error("Request body is missing");

  const stream = new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) this.push(null);
      else this.push(value);
    },
  });

  (stream as any).headers = Object.fromEntries(req.headers.entries());
  return stream as Readable & { headers: any };
}

export async function POST(req: Request) {
  try {
    const nodeReq = await createNodeRequest(req);
    const form = new IncomingForm();

    const { files } = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(nodeReq as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ files });
      });
    });

    const file = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    if (!file || !file.filepath) {
      return new Response(JSON.stringify({ error: "No audio file found" }), {
        status: 400,
      });
    }
    const tempPath = file.filepath;
    const correctedPath = `${tempPath}.webm`;
    fs.renameSync(tempPath, correctedPath);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(correctedPath),
      model: "whisper-1",
    });

    return new Response(JSON.stringify({ text: transcription.text }), {
      status: 200,
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return new Response(JSON.stringify({ error: "Transcription failed" }), {
      status: 500,
    });
  }
}
