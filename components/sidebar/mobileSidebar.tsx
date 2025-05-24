"use client";
import { useState } from "react";
import { SignOut } from "../auth/signout";
import { FiMenu } from "react-icons/fi";
import { useChatStore } from "@/store/store";

export function MobileSidebar() {
  const { chats, createNewChat, currentChatId, setCurrentChatId } =
    useChatStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <>
      <div className="md:hidden bg-white p-2 border-b border-gray-200 flex justify-between items-center">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <FiMenu size={20} />
        </button>
        <h1 className="text-lg font-semibold">English Tutor</h1>
        <div className="w-8"></div>
      </div>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>

          <div className="relative w-64 min-h-screen h-auto bg-white p-4 flex flex-col">
            <div className="flex-1">
              <button
                onClick={createNewChat}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-4 transition-colors cursor-pointer w-full"
              >
                New Chat
              </button>

              <div className="overflow-y-auto no-scrollbar h-[calc(100%-60px)]">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer mb-2 ${
                      currentChatId === chat.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <p className="truncate">{chat.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(chat.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="cursor-pointer">
              <SignOut />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
