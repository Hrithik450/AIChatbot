import { messages } from "@/lib/drizzle/schema";
import { z } from "zod";

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export const messageSchema = z.object({
  chat_id: z.string().uuid(),
  role: z.string(),
  content: z.string(),
});

export type MessageResponse = {
  success: boolean;
  data?: Message;
  error?: string;
};

export type MessagesResponse = {
  success: boolean;
  data?: Message[];
  error?: string;
};
