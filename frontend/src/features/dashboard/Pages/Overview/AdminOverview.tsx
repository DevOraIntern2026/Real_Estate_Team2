import { getErrorMessage } from "../../api";
import ErrorState from "../../components/shared/ErrorState";
import LinkButton from "../../components/shared/LinkButton";
import LoadingState from "../../components/shared/LoadingState";
import SectionHeader from "../../components/shared/SectionHeader";
import StatCard from "../../components/shared/StatCard";
import NotificationPreviewList from "../../components/notifications/NotificationPreviewList";
import { LISTING_PATH } from "../../constants/paths";
import { useAdmin } from "../../context/AdminContext";
import { getGreeting } from "../../utils/greeting";
import PendingListingRow from "./components/PendingListingRow";
import { NOTIFICATIONS_PATH, REPORTS_PATH, TEXT } from "./constants";
import { useAdminOverview } from "./useAdminOverview";

export default function AdminOverview() {
  const { admin } = useAdmin();
  const { data, isPending, isError, error, refetch, isRefetching } = useAdminOverview();

  const firstName = admin.name.split(" ")[0];

  return (
    <section className="p-8 text-[#241A12]">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b-[0.8px] border-[#87400E] pb-4">
        <div>
          <p className="font-medium">
            {getGreeting()}, {firstName}
          </p>
          <p className="text-[#5A4F49]">{TEXT.subtitle}</p>
        </div>
        <div className="flex gap-4">
          <LinkButton to={LISTING_PATH}>{TEXT.reviewPending}</LinkButton>
          <LinkButton to={REPORTS_PATH} variant="outline">
            {TEXT.viewReports}
          </LinkButton>
        </div>
      </div>

      {isPending ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState
          message={getErrorMessage(error)}
          onRetry={() => void refetch()}
          isRetrying={isRefetching}
        />
      ) : (
        <>
          <div className="my-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            <StatCard label="Total User" value={data.stats.totalUsers} />
            <StatCard label="Total Listing" value={data.stats.totalListings} />
            <StatCard label="New Users (30d)" value={data.stats.newUsers30d} />
            <StatCard label="Published" value={data.stats.published} />
          </div>

          <section>
            <SectionHeader title={TEXT.pendingTitle} to={LISTING_PATH} actionLabel={TEXT.viewAll} />
            {data.pendingListings.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#5A4F49]">{TEXT.noPending}</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {data.pendingListings.map((l) => (
                  <PendingListingRow key={l.id} listing={l} />
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8">
            <SectionHeader
              title={TEXT.notificationsTitle}
              to={NOTIFICATIONS_PATH}
              actionLabel={TEXT.viewAll}
            />
            {data.notifications.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#5A4F49]">{TEXT.noNotifications}</p>
            ) : (
              <NotificationPreviewList items={data.notifications} />
            )}
          </section>
        </>
      )}
    </section>
  );
}
