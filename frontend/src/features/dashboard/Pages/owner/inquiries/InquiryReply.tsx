import { Link, useParams } from "react-router-dom";
import ChatComposer from "../../../components/chat/ChatComposer";
import ChatThread from "../../../components/chat/ChatThread";
import PageHeader from "../../../components/shared/PageHeader";
import { OWNER_PATHS } from "../../../constants/paths";
import { useInquiries } from "../../../context/InquiriesContext";
import { TEXT } from "../constants";
import { useOwnerData } from "../useOwnerData";
import CustomerCard from "./components/CustomerCard";
import InquiryInfoCard from "./components/InquiryInfoCard";
import { useInquiryThread } from "./useInquiryThread";

export default function InquiryReply() {
  const { inquiryId = "" } = useParams<{ inquiryId: string }>();
  const { inquiries } = useOwnerData(); // only MY inquiries, so I can't open someone else's
  const { sendReply } = useInquiries();

  const inquiry = inquiries.find((i) => i.id === inquiryId);
  const messages = useInquiryThread(inquiry); // hooks first, early return after

  if (!inquiry) {
    return (
      <section className="p-8">
        <PageHeader title={TEXT.replyTitle} subtitle={TEXT.inquiriesSubtitle} />
        <p className="py-10 text-center text-sm text-[#5A4F49]">
          {TEXT.inquiryNotFound}{" "}
          <Link to={OWNER_PATHS.inquiries} className="text-[#87400E] underline">
            {TEXT.backToInquiries}
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="p-8 text-[#241A12]">
      <PageHeader title={TEXT.replyTitle} subtitle={TEXT.inquiriesSubtitle} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="flex flex-col gap-6">
          <CustomerCard inquiry={inquiry} />
          <InquiryInfoCard inquiry={inquiry} />
        </div>

        <section
          aria-label="Reply"
          className="flex min-h-[28rem] flex-col rounded-sm border-[0.8px] border-[#87400E] p-4"
        >
          <ChatThread messages={messages} />
          <ChatComposer
            label={TEXT.replyLabel}
            placeholder={TEXT.replyPlaceholder}
            onSend={(text) => sendReply(inquiry.id, text)}
          />
        </section>
      </div>
    </section>
  );
}
