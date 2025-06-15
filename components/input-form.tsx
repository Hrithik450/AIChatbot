"use client";

import { ChatMessage } from "@/lib/client/types.client";
import {
  useChatStore,
  useInputStore,
  useLoaderStore,
  useMessageStore,
} from "@/store/store";
import {
  FormEvent,
  MouseEvent,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { FiMic, FiStopCircle } from "react-icons/fi";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "./ui/prompt-input";
import { Button } from "./ui/button";
import { ArrowUp, CircleStop, Mic, Square } from "lucide-react";
import { CONTENT_SYSTEM_PROMPT } from "@/lib/prompt-engineer";
import { ClassicLoader } from "./classic-loader";

interface InputForm {
  recognitionRef: RefObject<any>;
}

export function InputForm({ recognitionRef }: InputForm) {
  const { input, setInput, setTranscript } = useInputStore();
  const { chatLoading, toggleChatLoading } = useLoaderStore();
  const { setMessage, saveMessage } = useMessageStore();
  const { currentChatId } = useChatStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [classicLoading, setClassicLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isRecording && canvasRef.current && streamRef.current) {
      startVisualizer(streamRef.current);
    }
  }, [isRecording, canvasRef.current]);

  useEffect(() => {
    const setupRecorder = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
          const response = await fetch("/api/model/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          if (data.text) {
            setInput(data.text);
          }
        } catch (error) {
          console.error("Transcription error:", error);
        } finally {
          setClassicLoading(false);
          setIsRecording(false);
        }
      };
    };

    setupRecorder();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startVisualizer = (stream: MediaStream) => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = 256;

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyzer);
    audioContextRef.current = audioCtx;
    analyserRef.current = analyzer;
    dataArrayRef.current = dataArray;

    const canvas = canvasRef.current;
    if (!canvas || !canvas.getContext) {
      console.warn("Canvas not ready");
      return;
    }

    const ctx = canvas?.getContext("2d");
    const draw = () => {
      if (!ctx || !analyzer) return;
      analyzer.getByteFrequencyData(dataArrayRef.current!);

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);

      const sliceWidth = 0.95;
      const gap = 2;
      const totalBarWidth = sliceWidth + gap;
      const centerY = canvas!.height / 2;

      let x = (canvas!.width - bufferLength * totalBarWidth) / 2;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i];
        const amplitude = Math.abs((v - 128) / 128);
        const y = amplitude * canvas!.height * 0.4;

        ctx.beginPath();
        ctx.strokeStyle = "#9ca3af";
        ctx.lineWidth = sliceWidth;
        ctx.moveTo(x, centerY - y);
        ctx.lineTo(x, centerY + y);
        ctx.stroke();

        x += totalBarWidth;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const toggleRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    if (isRecording) {
      mediaRecorder.stop();
      setClassicLoading(true);
      stopVisualizer();
    } else {
      audioChunksRef.current = [];
      mediaRecorder.start();
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
    <div className="sticky bottom-0 left-0 right-0 p-2 md:p-4 border-t border-gray-200">
      <PromptInput
        value={input}
        onValueChange={(value) => setInput(value)}
        className="max-w-3xl w-full mx-auto"
      >
        {isRecording ? (
          <div className="flex min-h-12 items-start">
            <div className="max-w-full min-w-0 flex-1">
              <canvas
                ref={canvasRef}
                width={300}
                height={40}
                className="w-full h-10 rounded bg-black"
              />
            </div>
          </div>
        ) : (
          <PromptInputTextarea
            placeholder="Ask me anything..."
            disabled={chatLoading}
          />
        )}

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
                classicLoading ? (
                  <ClassicLoader />
                ) : (
                  <CircleStop className="size-6" />
                )
              ) : (
                <FiMic className="size-6" />
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
