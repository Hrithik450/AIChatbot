import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChatMessage, ResponseData } from "./types.client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateRandomString = (length: number): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export const formatCorrectionMessage = (data: ResponseData): ChatMessage => {
  let formattedContent = `📝Original Sentence: ${data.originalSentence}\n\n`;
  formattedContent += `✅Corrected Sentence: ${data.correctedSentence}\n\n`;
  formattedContent += "🔍Explanations:\n";

  data.corrections.forEach((correction, index) => {
    formattedContent += `${index + 1}. ${correction.error}: ${
      correction.explanation
    }\n`;
  });

  return {
    role: "assistant",
    content: formattedContent,
  };
};
