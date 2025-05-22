"use client";
import { FormEvent } from "react";
import { FiMic, FiStopCircle } from "react-icons/fi";

interface InputFormProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isRecording: boolean;
  toggleRecording: () => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function InputForm({
  input,
  setInput,
  isLoading,
  isRecording,
  toggleRecording,
  handleSubmit,
}: InputFormProps) {
  return (
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
          disabled={isLoading}
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
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg disabled:opacity-50 transition-colors text-sm md:text-base"
        disabled={isLoading || !input.trim()}
      >
        Send
      </button>
    </form>
  );
}
