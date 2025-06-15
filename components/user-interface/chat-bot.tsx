"use client";

import { useEffect } from "react";
import { ChatUI } from "@/components/user-interface/chat-ui";
import { InputForm } from "@/components/user-interface/input-form";
import { Header } from "@/components/user-interface/header";
import { useMessageStore, useUserStore } from "@/store/store";
import { getSession } from "next-auth/react";

export function Chatbot() {
  const { setCurrentUserId } = useUserStore();
  const { messages } = useMessageStore();

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };

    fetchSession();
  }, []);

  return (
    <div className="relative flex-1 flex flex-col w-full mx-auto overflow-hidden">
      <Header />
      <div
        className={`${
          messages && messages.length === 0 ? "h-[calc(100%-200px)]" : "h-full"
        } flex flex-col justify-center`}
      >
        <ChatUI />
        <InputForm />
      </div>
    </div>
  );
}
