import { Button } from "@/components/ui/button";
import { FiMic } from "react-icons/fi";
import { CircleStop } from "lucide-react";
import { ClassicLoader } from "@/components/classic-loader";
import { PromptInputAction } from "@/components/ui/prompt-input";

interface MicButtonProps {
  isRecording: boolean;
  classicLoading: boolean;
  toggleRecording: () => void;
}

export function MicButton({
  isRecording,
  classicLoading,
  toggleRecording,
}: MicButtonProps) {
  return (
    <PromptInputAction tooltip={isRecording ? "Stop Recording" : "Record"}>
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
  );
}
