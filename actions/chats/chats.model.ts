import { db } from "@/lib/db";
import { chats } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { Chat, NewChat } from "./chats.types";

export class ChatsModel {
  static async createChat(data: NewChat): Promise<Chat> {
    const [chat] = await db.insert(chats).values(data).returning();
    return chat;
  }

  static async getChatById(id: string): Promise<Chat | null> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, id));
    return chat || null;
  }

  static async getChatsByUserId(id: string): Promise<Chat[]> {
    const chats = await db.query.chats.findMany({
      where: (chats, { eq }) => eq(chats.user_id, id),
    });
    return chats;
  }

  static async getMessagesByChatId(chatId: string) {
    const data = await db.query.chats.findFirst({
      where: (chats, { eq }) => eq(chats.id, chatId),
      with: {
        messages: {
          orderBy: (messages, { asc }) => [asc(messages.created_at)],
        },
      },
    });
    return data;
  }

  static async updateChat(
    id: string,
    data: Partial<NewChat>
  ): Promise<Chat | null> {
    const [chat] = await db
      .update(chats)
      .set({ ...data })
      .where(eq(chats.id, id))
      .returning();
    return chat || null;
  }

  static async deleteChat(id: string): Promise<boolean> {
    const result = await db.delete(chats).where(eq(chats.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async getChats(): Promise<Chat[]> {
    return await db.select().from(chats);
  }
}
