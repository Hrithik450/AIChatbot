"use client";

import { ChatMessage } from "@/lib/client/types.client";
import {
  useChatStore,
  useInputStore,
  useLoaderStore,
  useMessageStore,
} from "@/store/store";
import { FormEvent, MouseEvent, RefObject, useState } from "react";
import { FiMic, FiStopCircle } from "react-icons/fi";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "./ui/prompt-input";
import { Button } from "./ui/button";
import { ArrowUp, CircleStop, Mic, Square } from "lucide-react";
import { CONTENT_SYSTEM_PROMPT } from "@/lib/openai";

interface InputForm {
  recognitionRef: RefObject<any>;
}

export function InputForm({ recognitionRef }: InputForm) {
  const { input, setInput } = useInputStore();
  const [isRecording, setIsRecording] = useState(false);
  const { chatLoading, toggleChatLoading } = useLoaderStore();
  const { currentChatId } = useChatStore();
  const { setMessage, saveMessage } = useMessageStore();
  const [isLoading, setIsLoading] = useState(false);

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
      const res = await fetch("/api/model/voice", {
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

  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isRecording) toggleRecording();
    if (!input.trim() || chatLoading) return;

    const newMessage: ChatMessage = { role: "user", content: input };
    setMessage(newMessage);
    setInput("");
    toggleChatLoading();
    saveMessage(newMessage);

    try {
      const response = await fetch("/api/model/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage.content,
          systemPrompt: CONTENT_SYSTEM_PROMPT,
        }),
      });

      if (!response.ok) throw new Error("API request failed");
      const aiResponseRaw = await response.json();
      const aiResponse = aiResponseRaw.response.replace(/\\(?!n)/g, "");

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
      <PromptInput
        value={input}
        onValueChange={(value) => setInput(value)}
        className="max-w-3xl w-full mx-auto"
      >
        <PromptInputTextarea
          placeholder="Ask me anything..."
          disabled={chatLoading}
        />

        <PromptInputActions className="justify-end pt-2">
          <PromptInputAction
            tooltip={isRecording ? "Stop Recording" : "Record"}
          >
            <Button
              variant="default"
              size="icon"
              className={`h-8 w-8 rounded-full cursor-pointer bg-white text-gray-600 hover:bg-gray-200 ${
                isRecording ? "text-red-400 animate-pulse" : "text-gray-500"
              }`}
              onClick={toggleRecording}
            >
              {isRecording ? (
                <CircleStop className="size-6" />
              ) : (
                <Mic className="size-5" />
              )}
            </Button>
          </PromptInputAction>

          <PromptInputAction
            tooltip={isLoading ? "Stop generation" : "Send message"}
          >
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full cursor-pointer"
              onClick={handleSubmit}
              disabled={chatLoading || !input.trim()}
            >
              {isLoading ? (
                <Square className="size-5 fill-current" />
              ) : (
                <ArrowUp className="size-5" />
              )}
            </Button>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}
