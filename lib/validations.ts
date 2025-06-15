import * as z from "zod";

export const signInSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});
export type TSignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be atleast 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be atleast 6 characters.",
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
