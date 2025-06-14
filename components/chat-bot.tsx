"use client";

import { useRef, useEffect } from "react";
import { ChatUI } from "./chat-ui";
import { InputForm } from "./input-form";
import { Header } from "./header";
import { useInputStore, useUserStore } from "@/store/store";
import { getSession } from "next-auth/react";

export function Chatbot() {
  const recognitionRef = useRef<any>(null);
  const { setCurrentUserId } = useUserStore();
  const { setTranscript } = useInputStore();

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };

    fetchSession();
  }, []);

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
