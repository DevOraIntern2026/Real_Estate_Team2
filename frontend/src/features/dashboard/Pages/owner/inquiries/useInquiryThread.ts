import { useMemo } from "react";
import type { ChatMessage } from "../../../components/chat/chatTypes";
import { useInquiries } from "../../../context/InquiriesContext";
import type { InquiryRow } from "@/types/inquiry";

/** First customer message + all the replies, as chat messages (oldest first). */
export function useInquiryThread(inquiry: InquiryRow | undefined): ChatMessage[] {
  const { getReplies } = useInquiries();

  return useMemo(() => {
    if (!inquiry) return [];
    const first: ChatMessage = {
      id: `${inquiry.id}-first`,
      text: inquiry.message,
      createdAt: inquiry.createdAt,
      mine: false,
    };
    const replies = getReplies(inquiry.id).map<ChatMessage>((r) => ({
      id: r.id,
      text: r.text,
      createdAt: r.createdAt,
      mine: r.sender === "owner",
    }));
    return [first, ...replies];
  }, [inquiry, getReplies]);
}
