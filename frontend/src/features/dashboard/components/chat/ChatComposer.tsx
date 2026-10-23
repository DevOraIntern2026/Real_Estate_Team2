import { useState } from "react";
import { getErrorMessage } from "../../api";
import Button from "../shared/Button";
import { fieldClass } from "../shared/fieldStyles";

type ChatComposerProps = {
  /** may be async: while it runs the button shows "Sending…", and if it rejects the text is kept */
  onSend: (text: string) => void | Promise<void>;
  placeholder?: string;
  label?: string;
};

export default function ChatComposer({
  onSend,
  placeholder = "Write a message...",
  label = "Message",
}: ChatComposerProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSend = text.trim() !== "" && !sending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); // Enter key also sends
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      await onSend(text.trim());
      setText("");
    } catch (err) {
      setError(getErrorMessage(err)); // the text stays so nothing is lost
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4">
      <div className="flex gap-4">
        <input
          type="text"
          aria-label={label}
          value={text}
          placeholder={placeholder}
          readOnly={sending}
          onChange={(e) => setText(e.target.value)}
          className={fieldClass}
        />
        <Button type="submit" disabled={!canSend} className="w-40 shrink-0">
          {sending ? "Sending…" : "Send"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </form>
  );
}
