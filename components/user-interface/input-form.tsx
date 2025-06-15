"use client";
import { ChatMessage } from "@/lib/client/types.client";
import {
  useChatStore,
  useInputStore,
  useLoaderStore,
  useMessageStore,
} from "@/store/store";
import { MouseEvent, useState } from "react";
import { PromptInput, PromptInputActions } from "@/components/ui/prompt-input";
import { CONTENT_SYSTEM_PROMPT } from "@/lib/prompt-engineering";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { AudioVisualizer } from "@/components/audio-visualizer";
import { ChatInputTextarea } from "@/components/chat-input-text-area";
import { MicButton } from "@/components/mic-button";
import { SendButton } from "@/components/send-button";

export function InputForm() {
  const { input, setInput } = useInputStore();
  const { chatLoading, toggleChatLoading } = useLoaderStore();
  const { setMessage, saveMessage } = useMessageStore();
  const { currentChatId } = useChatStore();

  const [isLoading] = useState(false);
  const { canvasRef, isRecording, classicLoading, streamRef, toggleRecording } =
    useAudioRecorder(setInput);

  const autoSpeak = async (text: string) => {
    try {
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
      const response = await fetch("/api/model/text-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage.content,
          systemPrompt: CONTENT_SYSTEM_PROMPT,
          chatId: currentChatId,
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
    <div className="sticky bottom-0 left-0 right-0 p-2 md:p-4">
      <PromptInput
        value={input}
        onValueChange={(value) => setInput(value)}
        className="max-w-3xl w-full mx-auto"
      >
        {isRecording ? (
          <AudioVisualizer canvasRef={canvasRef} stream={streamRef.current} />
        ) : (
          <ChatInputTextarea
            placeholder="Ask me anything..."
            disabled={chatLoading}
          />
        )}

        <PromptInputActions className="justify-end pt-2">
          <MicButton
            isRecording={isRecording}
            classicLoading={classicLoading}
            toggleRecording={toggleRecording}
          />

          <SendButton
            isLoading={isLoading || chatLoading}
            isDisabled={chatLoading || !input.trim()}
            handleSubmit={handleSubmit}
          />
        </PromptInputActions>
      </PromptInput>
    </div>
  );
}
