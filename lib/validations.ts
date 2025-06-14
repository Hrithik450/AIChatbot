import * as z from "zod";

export const signInSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});
export type TSignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  username: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});
export type TSignUpSchema = z.infer<typeof signUpSchema>;

export const createContentSchema = z.object({
  message: z.string(),
  systemPrompt: z.string(),
  chatId: z.string().nullable(),
});
export type TCreateContentSchema = z.infer<typeof createContentSchema>;

export const createVoiceContentSchema = z.object({
  text: z.string(),
});
export type TCreateVoiceContentSchema = z.infer<
  typeof createVoiceContentSchema
>;
