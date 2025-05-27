"use client";

import { useRef, useEffect } from "react";
import { useChatStore, useInputStore } from "@/store/store";
import { ChatUI } from "./chatUI";
import { InputForm } from "./inputform";
import { Header } from "./header";

export default function Chatbot() {
  const { loadChats } = useChatStore();
  const { setTranscript } = useInputStore();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
      };

      recognitionRef.current = recognition;
    } else {
      alert("Speech Recognition not supported in this browser.");
    }

    loadChats();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full mx-auto relative overflow-hidden">
      <Header />
      <ChatUI />
      <InputForm recognitionRef={recognitionRef} />
    </div>
  );
}
