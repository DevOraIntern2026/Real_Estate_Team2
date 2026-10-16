import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { inquiriesMock, inquiryRepliesMock } from "../data/inquiries.mock";
import type { Inquiry, InquiryReply } from "../../../types/inquiry";

type InquiriesContextValue = {
  inquiries: Inquiry[];
  getReplies: (inquiryId: string) => InquiryReply[];
  /** adds the owner's reply and marks the inquiry as "Responded" */
  sendReply: (inquiryId: string, text: string) => void;
};

const InquiriesContext = createContext<InquiriesContextValue | null>(null);

/** Swap useState for your API later. */
export function InquiriesProvider({
  children,
  initialInquiries = inquiriesMock,
  initialReplies = inquiryRepliesMock,
}: {
  children: ReactNode;
  initialInquiries?: Inquiry[];
  initialReplies?: InquiryReply[];
}) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [replies, setReplies] = useState<InquiryReply[]>(initialReplies);
  const nextId = useRef(0);

  const getReplies = useCallback(
    (inquiryId: string) =>
      replies
        .filter((r) => r.inquiryId === inquiryId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [replies]
  );

  const sendReply = useCallback((inquiryId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    nextId.current += 1;
    setReplies((prev) => [
      ...prev,
      {
        id: `reply-${nextId.current}`,
        inquiryId,
        sender: "owner",
        text: trimmed,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status: "Responded" } : i))
    );
  }, []);

  const value = useMemo(
    () => ({ inquiries, getReplies, sendReply }),
    [inquiries, getReplies, sendReply]
  );

  return <InquiriesContext.Provider value={value}>{children}</InquiriesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useInquiries() {
  const ctx = useContext(InquiriesContext);
  if (!ctx) throw new Error("useInquiries must be used inside <InquiriesProvider>");
  return ctx;
}
