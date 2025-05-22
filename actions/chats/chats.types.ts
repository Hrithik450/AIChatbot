import { chats } from "@/lib/db/schema";
import { z } from "zod";

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;

export const chatSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string(),
});

export type ChatResponse = {
  success: boolean;
  data?: Chat;
  error?: string;
};

export type ChatsResponse = {
  success: boolean;
  data?: Chat[];
  error?: string;
};
