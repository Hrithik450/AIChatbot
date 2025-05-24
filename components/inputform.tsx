"use client";

import { ChatMessage } from "@/lib/client/types.client";
import {
  useChatStore,
  useInputStore,
  useLoaderStore,
  useMessageStore,
} from "@/store/store";
import { FormEvent, RefObject, useState } from "react";
import { FiMic, FiStopCircle } from "react-icons/fi";

interface InputForm {
  recognitionRef: RefObject<any>;
}

export function InputForm({ recognitionRef }: InputForm) {
  const { input, setInput } = useInputStore();
  const [isRecording, setIsRecording] = useState(false);
  const { chatLoading, toggleChatLoading } = useLoaderStore();
  const { currentChatId } = useChatStore();
  const { setMessage, saveMessage } = useMessageStore();

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in your browser");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const autoSpeak = async (text: string) => {
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error("Failed to get audio");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      return audioUrl;
    } catch (error) {
      console.error("Speak error:", error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isRecording) toggleRecording();
    if (!input.trim() || chatLoading || !currentChatId) return;

    const newMessage: ChatMessage = { role: "user", content: input };
    setMessage(newMessage);
    setInput("");
    toggleChatLoading();
    await saveMessage(newMessage);

    try {
      const response = await fetch("/api/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.content }),
      });

      if (!response.ok) throw new Error("API request failed");
      const aiResponseRaw = await response.json();
      const aiResponse = aiResponseRaw.correctedSentence.replace(
        /\\(?!n)/g,
        ""
      );

      const audioUrl = await autoSpeak(aiResponse);

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse,
      };

      setMessage(assistantMessage);
      toggleChatLoading();

      const audio = new Audio(audioUrl);
      audio.play();

      await saveMessage(assistantMessage);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessage(errorMessage);
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 p-2 md:p-4 border-t border-gray-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl mx-auto bg-white rounded-lg md:rounded-xl shadow-sm md:shadow-lg flex items-center p-1 md:p-2"
      >
        <div className="flex-1 relative mx-1 md:mx-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 text-sm md:text-base text-gray-800 focus:outline-none"
            placeholder="Type your sentence..."
            disabled={chatLoading}
          />
          <button
            type="button"
            onClick={toggleRecording}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full cursor-pointer ${
              isRecording ? "text-blue-500 animate-pulse" : "text-gray-500"
            }`}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? <FiStopCircle size={18} /> : <FiMic size={18} />}
          </button>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg disabled:opacity-50 transition-colors text-sm md:text-base cursor-pointer"
          disabled={chatLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
