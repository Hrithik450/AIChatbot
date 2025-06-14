import { users } from "@/lib/drizzle/schema";
import { z } from "zod";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const userSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(1),
});

export type UserResponse = {
  success: boolean;
  data?: User;
  error?: string;
};

export type UsersResponse = {
  success: boolean;
  data?: User[];
  error?: string;
};
