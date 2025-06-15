import { PromptInputTextarea } from "@/components/ui/prompt-input";

interface ChatInputTextareaProps {
  placeholder: string;
  disabled: boolean;
}

export function ChatInputTextarea({
  placeholder,
  disabled,
}: ChatInputTextareaProps) {
  return <PromptInputTextarea placeholder={placeholder} disabled={disabled} />;
}
