import { useNavigate } from "react-router-dom";
import DataTable from "../../../components/shared/DataTable";
import LinkButton from "../../../components/shared/LinkButton";
import LoadingState from "../../../components/shared/LoadingState";
import QueryErrorState from "../../../components/shared/QueryErrorState";
import SectionHeader from "../../../components/shared/SectionHeader";
import StatCard from "../../../components/shared/StatCard";
import NotificationPreviewList from "../../../components/notifications/NotificationPreviewList";
import { OWNER_PATHS, ownerInquiryPath } from "../../../constants/paths";
import { useAdmin } from "../../../context/AdminContext";
import { getGreeting } from "../../../utils/greeting";
import { NEW_INQUIRY_DAYS, TEXT } from "../constants";
import { recentInquiryColumns, recentPropertyColumns } from "./recentColumns";
import { useOwnerDashboard } from "./useOwnerDashboard";

const emptyText = (message: string) => (
  <p className="py-6 text-center text-sm text-[#5A4F49]">{message}</p>
);

export default function OwnerOverview() {
  const navigate = useNavigate();
  const { admin: owner } = useAdmin(); // the owner session is still the mock one (name only)
  const { data, isPending, isError, error, refetch, isRefetching } = useOwnerDashboard();

  const firstName = owner.name.split(" ")[0];

  return (
    <section className="p-8 text-[#241A12]">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b-[0.8px] border-[#87400E] pb-4">
        <div>
          <p className="font-medium">
            {getGreeting()}, {firstName}
          </p>
          <p className="text-sm text-[#5A4F49]">{TEXT.overviewSubtitle}</p>
        </div>
        <div className="flex gap-4">
          <LinkButton to={OWNER_PATHS.addProperty}>Add Property</LinkButton>
          <LinkButton to={OWNER_PATHS.reports} variant="outline">
            View Reports
          </LinkButton>
        </div>
      </div>

      {isPending ? (
        <LoadingState rows={4} />
      ) : isError ? (
        <QueryErrorState error={error} onRetry={() => void refetch()} isRetrying={isRefetching} />
      ) : (
        <>
          <div className="my-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            <StatCard label="Total Property" value={data.stats.totalProperties} />
            <StatCard label="Published" value={data.stats.published} />
            <StatCard label="Under Review" value={data.stats.underReview} />
            <StatCard label={`New Inquiries (${NEW_INQUIRY_DAYS}d)`} value={data.stats.newInquiries30d} />
          </div>

          <section>
            <SectionHeader title="Recent Properties" to={OWNER_PATHS.properties} />
            <DataTable
              columns={recentPropertyColumns}
              rows={data.properties}
              getRowKey={(p) => p.id}
              empty={emptyText(TEXT.noProperties)}
            />
          </section>

          <section className="mt-8">
            <SectionHeader title="Recent Inquiries" to={OWNER_PATHS.inquiries} />
            <DataTable
              columns={recentInquiryColumns}
              rows={data.inquiries}
              getRowKey={(i) => i.id}
              onRowClick={(i) => navigate(ownerInquiryPath(i.id))}
              empty={emptyText(TEXT.noInquiries)}
            />
          </section>

          <section className="mt-8">
            <SectionHeader title="Recent Notifications" to={OWNER_PATHS.notifications} />
            {data.notifications.length === 0 ? (
              emptyText(TEXT.noNotifications)
            ) : (
              <NotificationPreviewList items={data.notifications} />
            )}
          </section>
        </>
      )}
    </section>
  );
}
