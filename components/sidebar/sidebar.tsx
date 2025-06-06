"use client";
import { useChatStore } from "@/store/store";
import { SignOut } from "../auth/signout";
import { redirect, useRouter } from "next/navigation";
import { NotebookPen } from "lucide-react";

export function SideBar() {
  const { chats, currentChatId, createNewChat } = useChatStore();
  const router = useRouter();

  const handleChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    createNewChat();
    redirect("/");
  };

  return (
    <div className="hidden md:flex md:w-64 bg-white border-r border-gray-200 p-4 flex-col">
      <button
        onClick={handleNewChat}
        className="text-black hover:bg-zinc-100 py-2 px-4 rounded-full mb-4 transition-colors cursor-pointer text-sm md:text-base flex items-center justify-start gap-2"
      >
        <NotebookPen className="w-4 h-4" />
        <span>New chat</span>
      </button>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
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
