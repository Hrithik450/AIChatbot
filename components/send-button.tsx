import { MouseEvent } from "react";
import { Button } from "./ui/button";
import { ArrowUp, Square } from "lucide-react";
import { PromptInputAction } from "./ui/prompt-input";

interface SendButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  handleSubmit: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function SendButton({
  isLoading,
  isDisabled,
  handleSubmit,
}: SendButtonProps) {
  return (
    <PromptInputAction tooltip={isLoading ? "Stop generation" : "Send message"}>
      <Button
        variant="default"
        size="icon"
        className="h-8 w-8 rounded-full cursor-pointer"
        onClick={handleSubmit}
        disabled={isDisabled}
      >
        {isLoading ? (
          <Square className="size-5 fill-current" />
        ) : (
          <ArrowUp className="size-5" />
        )}
      </Button>
    </PromptInputAction>
  );
}
