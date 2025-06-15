import { useEffect, useRef, useState, useCallback } from "react";

interface AudioRecorderProps {
  isRecording: boolean;
  classicLoading: boolean;
  toggleRecording: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  streamRef: React.RefObject<MediaStream | null>;
}

export function useAudioRecorder(
  setInput: (text: string) => void
): AudioRecorderProps {
  const [isRecording, setIsRecording] = useState(false);
  const [classicLoading, setClassicLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const setupRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
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
            const response = await fetch("/api/model/speech-to-text", {
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
      } catch (error) {
        console.error("Error setting up media recorder:", error);
        alert(
          "Microphone access denied. Please enable it in your browser settings to use voice input."
        );
      }
    };

    setupRecorder();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [setInput]);

  const toggleRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) {
      console.warn("MediaRecorder not initialized.");
      return;
    }

    if (isRecording) {
      mediaRecorder.stop();
      setClassicLoading(true);
    } else {
      audioChunksRef.current = [];
      mediaRecorder.start();
      setIsRecording(true);
    }
  }, [isRecording]);

  return {
    isRecording,
    classicLoading,
    toggleRecording,
    canvasRef,
    streamRef,
  };
}
