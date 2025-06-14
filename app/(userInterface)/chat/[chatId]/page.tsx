"use client";
import { Chatbot } from "@/components/chat-bot";
import { useChatStore, useMessageStore } from "@/store/store";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

interface useParamProps {
  [key: string]: string | string[];
  chatId: string;
}

const Chat = () => {
  const { chatId } = useParams<useParamProps>();
  const { loadMessages } = useMessageStore();
  const { setCurrentChatId } = useChatStore();

  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
      setCurrentChatId(chatId);
    }
  }, [chatId]);

  return <Chatbot />;
};

export default Chat;
