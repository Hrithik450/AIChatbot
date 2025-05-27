import { Chat, ChatMessage, Message } from "@/lib/client/types.client";
import { create } from "zustand";

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  loadChat: (chatId: string) => void;
  loadChats: () => void;
  setChat: (newChat: Chat) => void;
  setCurrentChatId: (chatId: string) => void;
  createNewChat: () => void;
  clearChat: () => void;
}

interface MessageStore {
  messages: ChatMessage[];
  loadMessages: (chatId: string) => void;
  setMessage: (newMessage: ChatMessage) => void;
  saveMessage: (message: ChatMessage) => void;
}

interface LoaderStore {
  loading: boolean;
  chatLoading: boolean;
  toggleLoading: () => void;
  toggleChatLoading: () => void;
}

interface UserStore {
  currentUserId: string | null;
}

interface InputStore {
  input: string;
  setTranscript: (text: string) => void;
  setInput: (value: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChatId: null,
  loadChat: async (chatId) => {
    const { toggleLoading } = useLoaderStore.getState();
    const { setCurrentChatId } = get();
    try {
      toggleLoading();
      setCurrentChatId(chatId);
    } catch (error) {
      console.error(error);
    } finally {
      toggleLoading();
    }
  },
  loadChats: async () => {
    const { toggleLoading } = useLoaderStore.getState();

    try {
      toggleLoading();
      const response = await fetch(`/api/chats`);
      const chats: Chat[] = await response.json();
      set({ chats });
    } catch (e) {
      console.error("Error loading chats:", e);
    } finally {
      toggleLoading();
    }
  },
  setChat: (newChat) =>
    set((state) => ({
      chats: [...state.chats, newChat],
    })),
  setCurrentChatId: (chatId) => {
    set({ currentChatId: chatId });
    useMessageStore.getState().loadMessages(chatId);
  },
  createNewChat: async () => {
    try {
      set({ currentChatId: null });
      useMessageStore.setState({ messages: [] });
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  },
  clearChat: () => {
    set({ currentChatId: null });
    useMessageStore.setState({ messages: [] });
  },
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
    const { setChat, currentChatId, setCurrentChatId } =
      useChatStore.getState();
    const { currentUserId } = useUserStore.getState();
    let chatId = currentChatId;

    try {
      if (!chatId) {
        const titleRes = await fetch("/api/model/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: message.content }),
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
        setChat(newChat);
        setCurrentChatId(newChat.id);
        chatId = newChat.id;
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
    } catch (error) {
      console.error("Error saving message:", error);
    }
  },
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

export const useUserStore = create<UserStore>((set) => ({
  currentUserId: "87b4245c-f1a8-41ea-aec5-70cfc81b3e91",
}));

export const useInputStore = create<InputStore>((set) => ({
  input: "",
  setTranscript: (text) =>
    set((state) => ({
      input: state.input + " " + text,
    })),
  setInput: (value) => set({ input: value }),
}));
