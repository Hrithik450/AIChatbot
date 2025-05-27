"use client";
import Chatbot from "@/components/chatbot";
import { useChatStore } from "@/store/store";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

const Chat = () => {
  const params = useParams();
  const chatId = typeof params.chatId === "string" ? params.chatId : undefined;
  const { loadChat } = useChatStore();

  useEffect(() => {
    if (chatId) loadChat(chatId);
  }, [chatId]);

  return <Chatbot />;
};

export default Chat;
