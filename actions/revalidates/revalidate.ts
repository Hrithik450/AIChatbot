"use server";
import { revalidateTag } from "next/cache";

export async function revalidateChat() {
  revalidateTag(`user-chats`);
}

export async function revalidateChatMessages(chatId: string | null) {
  revalidateTag(`chat-${chatId}`);
}
