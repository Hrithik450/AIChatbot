import { ChatsService } from "@/actions/chats/chats.service";
import { Chat } from "@/actions/chats/chats.types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data: Partial<Chat> = await request.json();
    const response = await ChatsService.createChat(data);

    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const response = await ChatsService.getChatById(id);
      if (!response.success) {
        return NextResponse.json({ error: response.error }, { status: 404 });
      }
      return NextResponse.json(response.data);
    }

    const response = await ChatsService.listChats();
    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 500 });
    }
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
