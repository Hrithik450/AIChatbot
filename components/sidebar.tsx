"use client";
import { Chat } from "@/lib/types.client";

interface ChatListProps {
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (id: string) => void;
  createNewChat: () => Promise<void>;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export function MobileSidebar({
  chats,
  currentChatId,
  setCurrentChatId,
  createNewChat,
  isMobile = false,
  onMobileClose,
}: ChatListProps) {
  return (
    <div
      className={`${
        isMobile ? "fixed inset-0 z-50 md:hidden" : "hidden md:flex md:w-64"
      } bg-white p-4 flex-col`}
    >
      {isMobile && (
        <div
          className="absolute inset-0 bg-opacity-50"
          onClick={onMobileClose}
        ></div>
      )}
      <div
        className={`relative ${
          isMobile ? "w-64 min-h-screen h-auto bg-white p-4" : ""
        } flex flex-col`}
      >
        <button
          onClick={createNewChat}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mb-4 transition-colors cursor-pointer text-sm md:text-base"
        >
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChatId(chat.id);
                onMobileClose?.();
              }}
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
      </div>
    </div>
  );
}
