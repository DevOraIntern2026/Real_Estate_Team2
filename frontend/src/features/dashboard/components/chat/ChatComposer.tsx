import { useState } from "react";
import Button from "../shared/Button";
import { fieldClass } from "../shared/fieldStyles";

type ChatComposerProps = {
  onSend: (text: string) => void;
  placeholder?: string;
  label?: string;
};

export default function ChatComposer({
  onSend,
  placeholder = "Write a message...",
  label = "Message",
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const canSend = text.trim() !== "";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // Enter key also sends
        if (!canSend) return;
        onSend(text.trim());
        setText("");
      }}
      className="mt-4 flex gap-4"
    >
      <input
        type="text"
        aria-label={label}
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        className={fieldClass}
      />
      <Button type="submit" disabled={!canSend} className="w-40 shrink-0">
        Send
      </Button>
    </form>
  );
}
