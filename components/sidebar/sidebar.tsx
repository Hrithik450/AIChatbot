"use client";

import { useChatStore, useMessageStore, useUserStore } from "@/store/store";
import { SignOut } from "../auth/signout";

export function SideBar() {
  const { chats, currentChatId, setChat, setCurrentChatId, createNewChat } =
    useChatStore();

  return (
    <div className="hidden md:flex md:w-64 bg-white border-r border-gray-200 p-4 flex-col">
      <button
        onClick={createNewChat}
        disabled
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-4 transition-colors cursor-pointer text-sm md:text-base disabled:opacity-50"
      >
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setCurrentChatId(chat.id)}
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
