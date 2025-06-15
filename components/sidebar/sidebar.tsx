"use client";
import { SignOut } from "../auth/sign-out";
import { redirect, useRouter } from "next/navigation";
import { NotebookPen, Plus } from "lucide-react";
import { UsersService } from "@/actions/users/users.service";
import React, { useEffect } from "react";
import { useChatStore, useMessageStore } from "@/store/store";

interface SideBarProps {
  promises: Promise<
    [Awaited<ReturnType<typeof UsersService.getChatsByUserId>>]
  >;
}

export function SideBar({ promises }: SideBarProps) {
  const [{ data }] = React.use(promises);
  const { currentChatId, setCurrentChatId } = useChatStore();
  const { clearMessages } = useMessageStore();
  const router = useRouter();

  const handleChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    clearMessages();
    redirect("/");
  };

  return (
    <div className="hidden md:flex md:w-64 bg-white border-r border-gray-200 p-4 flex-col">
      <button
        onClick={handleNewChat}
        className="text-black hover:bg-zinc-100 py-2 px-4 rounded-full mb-4 transition-colors cursor-pointer text-sm md:text-base flex items-center justify-start gap-2"
      >
        <Plus className="w-4 h-4" />
        <span>New chat</span>
      </button>

      <div className="flex-1 overflow-y-auto">
        {data?.chats &&
          data.chats.length > 0 &&
          data.chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChat(chat.id)}
              className={`p-2 md:px-5 rounded-full cursor-pointer mb-2 text-sm md:text-base ${
                currentChatId === chat.id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <p className="truncate line-clamp-1">{chat.title}</p>
            </div>
          ))}
      </div>

      <div className="cursor-pointer">
        <SignOut />
      </div>
    </div>
  );
}
