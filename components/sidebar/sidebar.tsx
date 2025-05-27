"use client";
import { useChatStore } from "@/store/store";
import { SignOut } from "../auth/signout";
import { redirect, useRouter } from "next/navigation";

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
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mb-4 transition-colors cursor-pointer text-sm md:text-base"
      >
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleChat(chat.id)}
            className={`p-2 md:p-3 rounded-lg cursor-pointer mb-2 text-sm md:text-base ${
              currentChatId === chat.id ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            <p className="truncate">{chat.title}</p>
            <p className="text-xs text-gray-500">
              {new Date(chat.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="cursor-pointer">
        <SignOut />
      </div>
    </div>
  );
}
