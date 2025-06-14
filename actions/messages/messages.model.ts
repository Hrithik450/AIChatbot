import { db } from "@/lib/db";
import { messages } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { Message, NewMessage } from "./messages.types";
import { unstable_cache } from "next/cache";

export class MessagesModel {
  static async createMessage(data: NewMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  }

  static async getMessageById(id: string): Promise<Message | null> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message || null;
  }

  static async getMessageByChatId(chatId: string) {
    const cachedMessages = unstable_cache(
      async () => {
        try {
          return await db
            .select()
            .from(messages)
            .where(eq(messages.chat_id, chatId));
        } catch (error) {
          return [];
        }
      },
      [`messages_by_chat_${chatId}`],
      {
        revalidate: 3600,
        tags: [`chat-${chatId}`],
      }
    );

    return await cachedMessages();
  }

  static async deleteMessagesByChatId(chatId: string): Promise<boolean> {
    const result = await db
      .delete(messages)
      .where(eq(messages.chat_id, chatId));
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async listMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }
}
