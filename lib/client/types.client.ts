export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  chat_id: string;
  created_at: string;
}

export interface ChatMessage {
  role: string;
  content: string;
}
