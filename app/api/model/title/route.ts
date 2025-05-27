import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

const SYSTEM_PROMPT = `
You are an AI assistant tasked with creating a short, descriptive title for a new chat conversation. Your goal is to summarize the user's initial message in a way that accurately reflects the main topic or intent.

I. Core Task:
When you receive the message from a user, you will:
1. Analyze the Message: Read and understand the core subject, intent, or question in the user's initial message.
2. Generate a Title: Create a concise title (maximum 5 words) that encapsulates the message's content.

II. Output Format:
Your response should be only the JSON object with title, with no additional text or formatting.
{
   "title" : [Your Title Output]
}

III. Guiding Principles & Constraints:
1.  Brevity is Key: The title MUST be short. Aim for 2-5 words.
2.  Relevance: The title must directly reflect the content of the user's message.
3.  Clarity: The title should be understandable at a glance.
4.  No Conversation: Do NOT engage in conversation, ask questions, or provide explanations. Your only output is the title.
5.  No Punctuation: Do NOT include any punctuation at the end of the title (e.g., no periods, question marks).
6.  Capitalization: Capitalize the first letter of each significant word in the title (Title Case).
7.  No Emojis or Special Characters: The title should consist only of standard English alphabet characters and spaces.
8.  Single Output: Provide ONLY the title string. Nothing else.

IV. Examples of Interaction (Internal Guidance):

User Input: "Hi, I want to learn English today. How can you help me?"
Expected Output:
{
  "title" : "Learn English Today"
}

User Input: "Can you check my sentence: 'I go to the store yesterday'."
Expected Output:
{
  "title" : "Check My Sentence"
}

User Input: "What is the past tense of 'run'?"
Expected Output:
{
  "title" : "Past Tense of Run"
}

User Input: "Tell me about articles a an the."
Expected Output:
{
  "title" : "About English Articles"
}
`;

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message || message === "")
    return NextResponse.json({ error: "Please provide a text" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("Server is busy, try again later!");

    const response = JSON.parse(content);
    return NextResponse.json(response);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 500 }
    );
  }
}
