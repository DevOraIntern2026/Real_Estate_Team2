import { ApiError } from "../../../api";
import type { ChatMessage } from "../../../components/chat/chatTypes";
import { formatPriceLabel, prettify } from "../../../utils/labels";
import { isRecord, listOf, pick, pickNumber, pickString } from "../../../utils/pick";
import type { InquiryDetailVm } from "./types";

/**
 * GET /inquiries/{id}. ASSUMED fields (the create-inquiry body in the Swagger names them
 * customerName / customerEmail / customerPhone / message). The property can be nested
 * (property.title ...) or flat (propertyTitle ...).
 */
export function normalizeInquiryDetail(raw: unknown): InquiryDetailVm {
  const root = isRecord(raw) ? (isRecord(raw.data) ? raw.data : isRecord(raw.inquiry) ? raw.inquiry : raw) : {};
  const id = pickString(root, "id", "_id");

  if (!id) {
    if (import.meta.env?.DEV) console.warn("[api] Unrecognized inquiry response:", raw);
    throw new ApiError(500, "Unexpected response from the server.", raw);
  }

  const purposeRaw = pickString(root, "property.transaction", "transaction") ?? "";
  const price = pickNumber(root, "property.price", "price");

  return {
    id,
    customerName: pickString(root, "customerName", "customer.name", "name") ?? "",
    customerEmail: pickString(root, "customerEmail", "email", "customer.email") ?? "",
    customerPhone: pickString(root, "customerPhone", "phone", "customer.phone") ?? "",
    customerAvatar: pickString(root, "customerAvatar", "customer.avatar"),
    message: pickString(root, "message") ?? "",
    status: prettify(pickString(root, "status") ?? "new"),
    createdAt: pickString(root, "createdAt") ?? "",
    property: {
      title: pickString(root, "property.title", "propertyTitle") ?? "",
      code: pickString(root, "property.code", "propertyCode") ?? "",
      type: prettify(pickString(root, "property.propertyType", "propertyType", "property.type") ?? ""),
      purpose: prettify(purposeRaw),
      // ASSUMED: EGP when no currency is sent
      priceLabel:
        price === undefined
          ? "—"
          : formatPriceLabel(price, pickString(root, "property.currency", "currency") ?? "EGP", purposeRaw),
    },
  };
}

/** true when the message was written by the customer (left side), false = by me (right side) */
function isFromCustomer(item: unknown): boolean {
  const sender = pickString(item, "sender", "senderType", "senderRole", "from", "authorType", "role");
  if (sender) return sender.toLowerCase().includes("customer");
  return Boolean(pick(item, "isCustomer", "fromCustomer"));
}

/** GET /inquiries/{id}/messages -> chat messages, oldest first. ASSUMED: text in message/text/content, sender in sender/senderType/... */
export function normalizeMessages(raw: unknown): ChatMessage[] {
  return listOf(raw)
    .map((item, index): ChatMessage => ({
      id: pickString(item, "id", "_id") ?? `m${index}`,
      text: pickString(item, "message", "text", "content", "body") ?? "",
      createdAt: pickString(item, "createdAt", "sentAt") ?? "",
      mine: !isFromCustomer(item),
    }))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * The conversation to display. If the messages endpoint already contains the customer's first
 * message we use it as is; if not, we put the inquiry's own message first.
 */
export function buildThread(detail: InquiryDetailVm | undefined, messages: ChatMessage[]): ChatMessage[] {
  if (!detail) return messages;
  const hasFirst = messages.some((m) => !m.mine && m.text === detail.message);
  if (hasFirst || !detail.message) return messages;
  return [
    { id: `${detail.id}-first`, text: detail.message, createdAt: detail.createdAt, mine: false },
    ...messages,
  ];
}
