"use client";

import { Ref, useRef, useState, useEffect } from "react";
import { FiCopy, FiVolume2 } from "react-icons/fi";
import { useLoaderStore, useMessageStore } from "@/store/store";
import { Loader } from "@/components/loader";
import { ClassicLoader } from "@/components/classic-loader";

interface ChatUI {
  messagesEndRef: Ref<HTMLDivElement>;
}

export function ChatUI() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages } = useMessageStore();
  const { chatLoading, loading } = useLoaderStore();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const speak = async (text: string, index?: number) => {
    try {
      if (index) setLoadingIndex(index);
      const res = await fetch("/api/model/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to get audio");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Speak error:", error);
    } finally {
      if (index) setLoadingIndex(null);
    }
  };

  return loading ? (
    <div className="w-full flex justify-center items-center">
      <ClassicLoader />
    </div>
  ) : messages.length === 0 ? (
    <div className="flex items-center justify-center p-4">
      <div className="text-center text-gray-500">
        <p className="text-lg md:text-xl mb-2">Start a new conversation</p>
        <p className="text-sm md:text-base">
          Type or speak an English sentence to get corrections
        </p>
      </div>
    </div>
  ) : (
    <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto p-2 md:p-4">
      {messages &&
        messages.length > 0 &&
        messages.map((message, index) => (
          <div
            key={index}
            className={`mb-3 md:mb-4 p-3 md:p-4 text-sm md:text-base rounded-xl max-w-[90%] md:max-w-[100%] w-[max-content] ${
              message.role === "user" ? "bg-zinc-200 ml-auto" : ""
            }`}
          >
            {message.role === "assistant" ? (
              <div className="whitespace-pre-line">
                {message.content.split("\n").map((line, i) => (
                  <p key={i}>
                    {line.split('"').map((part, index) =>
                      index % 2 === 1 ? (
                        <span className="font-semibold" key={index}>
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )}
                  </p>
                ))}
              </div>
            ) : (
              <p>{message.content}</p>
            )}

            {message.role === "assistant" && (
              <div className="flex justify-start mt-3 space-x-2">
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
        ))}

      {chatLoading && (
        <div className="mb-3 md:mb-4 p-3 md:p-4 rounded-lg bg-gray-100 mr-auto max-w-[90%] md:max-w-[80%]">
          <div className="flex items-center gap-2">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
            </div>

            <span className="text-sm md:text-base">
              Analyzing your sentence...
            </span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
