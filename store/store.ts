import {
  revalidateChat,
  revalidateChatMessages,
} from "@/actions/revalidates/revalidate";
import { ChatMessage, Message } from "@/lib/client/types.client";
import { TITLE_SYSTEM_PROMPT } from "@/lib/openai";
import { create } from "zustand";

interface ChatStoreProps {
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
}

interface InputStore {
  input: string;
  setTranscript: (text: string) => void;
  setInput: (value: string) => void;
}

interface LoaderStore {
  loading: boolean;
  chatLoading: boolean;
  toggleLoading: () => void;
  toggleChatLoading: () => void;
}

interface MessageStore {
  messages: ChatMessage[];
  loadMessages: (chatId: string) => void;
  setMessage: (newMessage: ChatMessage) => void;
  saveMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

interface UserStore {
  currentUserId: string | null;
  setCurrentUserId: (id: string) => void;
}

export const useChatStore = create<ChatStoreProps>((set) => ({
  currentChatId: null,
  setCurrentChatId: (id) => set({ currentChatId: id }),
}));

export const useInputStore = create<InputStore>((set) => ({
  input: "",
  setTranscript: (text) =>
    set((state) => ({
      input: state.input + " " + text,
    })),
  setInput: (value) => set({ input: value }),
}));

export const useLoaderStore = create<LoaderStore>((set) => ({
  loading: false,
  chatLoading: false,
  toggleLoading: () =>
    set((state) => ({
      loading: !state.loading,
    })),
  toggleChatLoading: () =>
    set((state) => ({
      chatLoading: !state.chatLoading,
    })),
}));

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  loadMessages: async (chatId) => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`);
      const data: Message[] = await response.json();
      const messages = data.map((message) => ({
        role: message.role,
        content: message.content,
      }));

      set({ messages });
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  },
  setMessage: (newMessage) =>
    set((state) => ({
      messages: [...state.messages, newMessage],
    })),

  saveMessage: async (message) => {
    const { currentChatId, setCurrentChatId } = useChatStore.getState();
    const { currentUserId } = useUserStore.getState();
    let chatId = currentChatId;

    try {
      if (!chatId) {
        const titleRes = await fetch("/api/model/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message.content,
            systemPrompt: TITLE_SYSTEM_PROMPT,
          }),
        });
        const titleData = await titleRes.json();
        if (!titleData?.title) return;

        const chatRes = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: currentUserId,
            title: titleData.title,
          }),
        });
        const newChat = await chatRes.json();
        setCurrentChatId(newChat.id);
        chatId = newChat.id;
        revalidateChat();
      }

      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          role: message.role,
          content: message.content,
        }),
      });
      revalidateChatMessages(chatId);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  },
  clearMessages: () => {
    set({ messages: [] });
  },
}));

export const useUserStore = create<UserStore>((set) => ({
  currentUserId: null,
  setCurrentUserId: (id) => set({ currentUserId: id }),
}));
