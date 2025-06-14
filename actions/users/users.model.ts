import { db } from "@/lib/db";
import { users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import type { NewUser, User } from "./users.types";
import { unstable_cache } from "next/cache";

export class UsersModel {
  static async createUser(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  static async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  static async updateUser(
    id: string,
    data: Partial<NewUser>
  ): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ ...data })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  static async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async getChatsByUserId(id: string) {
    const cachedChats = unstable_cache(
      async () => {
        const chats = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, id),
          with: {
            chats: { columns: { id: true, title: true } },
          },
        });
        return chats;
      },
      ["chats_by_user"],
      {
        tags: ["user-chats"],
        revalidate: 3600,
      }
    );

    return await cachedChats();
  }

  static async getMessagesOfChatId(chatId: string) {
    const messages = await db.query.chats.findFirst({
      where: (chats, { eq }) => eq(chats.id, chatId),
      with: {
        messages: { columns: { role: true, content: true } },
      },
    });
    return messages;
  }

  static async listUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
}
