import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Message, NewMessage } from "./messages.types";

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

  static async getMessageByChatId(chatId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.chat_id, chatId));
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
