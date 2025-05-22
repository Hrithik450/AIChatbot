"use client";
import { ChatMessage } from "@/lib/types.client";
import { FiCopy, FiVolume2 } from "react-icons/fi";
import { Loader } from "./loader";

interface MessageProps {
  message: ChatMessage;
  index: number;
  loadingIndex: number | null;
  speak: (text: string, index: number) => void;
}

export function Message({ message, index, loadingIndex, speak }: MessageProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className={`mb-3 md:mb-4 p-3 md:p-4 text-sm md:text-base rounded-lg max-w-[90%] md:max-w-[80%] ${
        message.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-200 mr-auto"
      }`}
    >
      {message.role === "assistant" ? (
        <div className="whitespace-pre-line">
          {message.content.split("\n").map((line, i) => (
            <p key={i} className={i === 0 ? "font-semibold" : ""}>
              {line}
            </p>
          ))}
        </div>
      ) : (
        <p>{message.content}</p>
      )}

      {message.role === "assistant" && (
        <div className="flex justify-end mt-2 space-x-2">
          <button
            onClick={() => copyToClipboard(message.content)}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            title="Copy"
          >
            <FiCopy size={16} />
          </button>

          {loadingIndex === index ? (
            <button className="text-gray-500" title="Loading">
              <Loader />
            </button>
          ) : (
            <button
              onClick={() => speak(message.content, index)}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              title="Speak"
            >
              <FiVolume2 size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
