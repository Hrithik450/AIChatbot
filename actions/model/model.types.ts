import { z } from "zod";

export const ModelSchema = z.object({
  message: z.string(),
  systemPrompt: z.string(),
});

export type Model = {
  message: string;
  systemPrompt: string;
};
