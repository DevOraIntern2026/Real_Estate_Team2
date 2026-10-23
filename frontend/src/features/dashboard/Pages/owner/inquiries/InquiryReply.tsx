import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { isApiError } from "../../../api";
import ChatComposer from "../../../components/chat/ChatComposer";
import ChatThread from "../../../components/chat/ChatThread";
import LoadingState from "../../../components/shared/LoadingState";
import PageHeader from "../../../components/shared/PageHeader";
import QueryErrorState from "../../../components/shared/QueryErrorState";
import { OWNER_PATHS } from "../../../constants/paths";
import { TEXT } from "../constants";
import CustomerCard from "./components/CustomerCard";
import InquiryInfoCard from "./components/InquiryInfoCard";
import { buildThread } from "./mappers";
import { useInquiry, useInquiryMessages, useSendReply } from "./queries";

export default function InquiryReply() {
  const { inquiryId = "" } = useParams<{ inquiryId: string }>();
  const inquiry = useInquiry(inquiryId);
  const messages = useInquiryMessages(inquiryId);
  const send = useSendReply(inquiryId);

  const thread = useMemo(
    () => buildThread(inquiry.data, messages.data ?? []),
    [inquiry.data, messages.data]
  );

  const header = <PageHeader title={TEXT.replyTitle} subtitle={TEXT.inquiriesSubtitle} />;

  if (inquiry.isPending) {
    return (
      <section className="p-8">
        {header}
        <LoadingState rows={4} />
      </section>
    );
  }

  if (inquiry.isError) {
    const notFound = isApiError(inquiry.error) && inquiry.error.status === 404;
    return (
      <section className="p-8">
        {header}
        {notFound ? (
          <p className="py-10 text-center text-sm text-[#5A4F49]">
            {TEXT.inquiryNotFound}{" "}
            <Link to={OWNER_PATHS.inquiries} className="text-[#87400E] underline">
              {TEXT.backToInquiries}
            </Link>
          </p>
        ) : (
          <QueryErrorState
            error={inquiry.error}
            onRetry={() => void inquiry.refetch()}
            isRetrying={inquiry.isRefetching}
          />
        )}
      </section>
    );
  }

  const detail = inquiry.data;

  return (
    <section className="p-8 text-[#241A12]">
      {header}

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-6">
          <CustomerCard inquiry={detail} />
          <InquiryInfoCard inquiry={detail} />
        </div>

        <section
          aria-label="Reply"
          className="flex min-h-[28rem] flex-col rounded-sm border-[0.8px] border-[#87400E] p-4"
        >
          {messages.isPending ? (
            <LoadingState rows={2} />
          ) : messages.isError ? (
            // the page keeps working even if the conversation fails to load
            <QueryErrorState
              error={messages.error}
              onRetry={() => void messages.refetch()}
              isRetrying={messages.isRefetching}
            />
          ) : (
            <ChatThread messages={thread} />
          )}

          <ChatComposer
            label={TEXT.replyLabel}
            placeholder={TEXT.replyPlaceholder}
            onSend={(text) => send.mutateAsync(text).then(() => undefined)}
          />
        </section>
      </div>
    </section>
  );
}
