export interface ChatMessage {
  role: string;
  content: string;
}

export interface ResponseData {
  originalSentence: string;
  correctedSentence: string;
  corrections: Correction[];
}

export interface Correction {
  error: string;
  explanation: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}
