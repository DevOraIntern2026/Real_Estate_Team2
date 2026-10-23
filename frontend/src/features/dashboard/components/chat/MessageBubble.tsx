import { formatMessageTime } from "../../utils/dateTime";
import type { ChatMessage } from "./chatTypes";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const { mine, text, createdAt } = message;

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-sm px-4 py-3 text-sm ${
          mine
            ? "bg-[#87400E] text-[#FAFAFA]"
            : "border-[0.8px] border-[#87400E] text-[#87400E]"
        }`}
      >
        <span className="sr-only">{mine ? "You: " : "Customer: "}</span>
        <p className="whitespace-pre-wrap break-words">{text}</p>
        <p className={`mt-2 text-end text-[11px] ${mine ? "text-[#FAFAFA]/80" : "text-[#87400E]/80"}`}>
          {formatMessageTime(createdAt)}
        </p>
      </div>
    </div>
  );
}
