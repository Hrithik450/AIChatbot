import { MessagesService } from "@/actions/messages/messages.service";
import { Message } from "@/actions/messages/messages.types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data: Partial<Message> = await request.json();
    const response = await MessagesService.createMessage(data);

    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const chatId = searchParams.get("chatId");

    if (id) {
      const response = await MessagesService.getMessageById(id);
      if (!response.success) {
        return NextResponse.json({ error: response.error }, { status: 404 });
      }
      return NextResponse.json(response.data);
    }

    if (chatId) {
      const response = await MessagesService.getMessagesByChatId(chatId);
      if (!response.success) {
        return NextResponse.json({ error: response.error }, { status: 404 });
      }
      return NextResponse.json(response.data);
    }

    const response = await MessagesService.listMessages();
    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 500 });
    }
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
