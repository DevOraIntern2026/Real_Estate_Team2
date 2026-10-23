import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { normalizePaginated } from "../../../api";
import { toRecentInquiry } from "../overview/mappers";
import { fetchInquiries, fetchInquiry, fetchInquiryMessages, sendInquiryReply } from "./api";
import { buildThread, normalizeInquiryDetail, normalizeMessages } from "./mappers";
import type { InquiriesParams } from "./types";

// every key starts with ["owner","inquiries"]: one invalidate refreshes list + details + messages
export const ownerInquiriesRoot = ["owner", "inquiries"] as const;
export const inquiriesKey = (params: InquiriesParams) => [...ownerInquiriesRoot, "list", params] as const;
export const inquiryKey = (id: string) => [...ownerInquiriesRoot, "detail", id] as const;
export const messagesKey = (id: string) => [...inquiryKey(id), "messages"] as const;

const NEW_MESSAGES_EVERY_MS = 15_000;

export function useInquiries(params: InquiriesParams) {
  return useQuery({
    queryKey: inquiriesKey(params),
    queryFn: async ({ signal }) =>
      normalizePaginated<unknown>(await fetchInquiries(params, signal), {
        page: params.page,
        limit: params.limit,
      }),
    // same row shape as "Recent Inquiries" on the Home page
    select: (page) => ({ ...page, items: page.items.map(toRecentInquiry) }),
    placeholderData: keepPreviousData,
  });
}

export function useInquiry(id: string) {
  return useQuery({
    queryKey: inquiryKey(id),
    queryFn: async ({ signal }) => normalizeInquiryDetail(await fetchInquiry(id, signal)),
    enabled: Boolean(id),
  });
}

export function useInquiryMessages(id: string) {
  return useQuery({
    queryKey: messagesKey(id),
    queryFn: async ({ signal }) => normalizeMessages(await fetchInquiryMessages(id, signal)),
    enabled: Boolean(id),
    refetchInterval: NEW_MESSAGES_EVERY_MS, // the customer may write back while the page is open
  });
}

/** Send a reply, then refresh the conversation, the inquiry status, the list and the Home page. */
export function useSendReply(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => sendInquiryReply(id, text),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ownerInquiriesRoot }),
        qc.invalidateQueries({ queryKey: ["owner", "dashboard"] }),
      ]),
  });
}

export { buildThread };
