"use client";
import { useState } from "react";
import { SignOut } from "../auth/signout";
import { FiMenu } from "react-icons/fi";
import { useChatStore } from "@/store/store";
import { NotebookPen } from "lucide-react";
import { redirect } from "next/navigation";

export function MobileSidebar() {
  const { chats, createNewChat, currentChatId, setCurrentChatId } =
    useChatStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleNewChat = () => {
    createNewChat();
    redirect("/");
  };

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
                onClick={handleNewChat}
                className="text-black hover:bg-zinc-100 py-2 px-4 rounded-full mb-4 transition-colors cursor-pointer text-sm md:text-base flex items-center justify-start gap-2"
              >
                <NotebookPen className="w-4 h-4" />
                <span>New chat</span>
              </button>

              <div className="overflow-y-auto no-scrollbar h-[calc(100%-60px)]">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setCurrentChatId(chat.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`px-4 py-2 rounded-full cursor-pointer mb-2 ${
                      currentChatId === chat.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <p className="truncate line-clamp-1">{chat.title}</p>
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
