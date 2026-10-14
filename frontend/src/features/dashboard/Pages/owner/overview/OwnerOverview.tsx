import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../../components/shared/DataTable";
import LinkButton from "../../../components/shared/LinkButton";
import SectionHeader from "../../../components/shared/SectionHeader";
import StatCard from "../../../components/shared/StatCard";
import { OWNER_PATHS, ownerInquiryPath } from "../../../constants/paths";
import { useNotifications } from "../../../context/NotificationsContext";
import { getGreeting } from "../../../utils/greeting";
import { inquiryColumns, ownerPropertyColumns } from "../columns";
import { NEW_INQUIRY_DAYS, TEXT } from "../constants";
import { useOwnerData } from "../useOwnerData";
import RecentNotifications from "./RecentNotifications";

const DAY_MS = 24 * 60 * 60 * 1000;
const byNewest = <T,>(date: (item: T) => string) => (a: T, b: T) =>
  new Date(date(b)).getTime() - new Date(date(a)).getTime();

const emptyText = (message: string) => (
  <p className="py-6 text-center text-sm text-[#5A4F49]">{message}</p>
);

export default function OwnerOverview() {
  const navigate = useNavigate();
  const { owner, properties, inquiries } = useOwnerData();
  const { notifications } = useNotifications();

  const firstName = owner.name.split(" ")[0];

  const stats = useMemo(() => {
    const now = Date.now();
    return [
      { label: "Total Property", value: properties.length },
      { label: "Published", value: properties.filter((p) => p.status === "Published").length },
      { label: "Under Review", value: properties.filter((p) => p.status === "Under Review").length },
      {
        label: `New Inquiries (${NEW_INQUIRY_DAYS}d)`,
        value: inquiries.filter(
          (i) =>
            i.status === "New" &&
            now - new Date(i.createdAt).getTime() <= NEW_INQUIRY_DAYS * DAY_MS
        ).length,
      },
    ];
  }, [properties, inquiries]);

  const recentProperties = useMemo(
    () => [...properties].sort(byNewest((p) => p.updatedAt)).slice(0, 3),
    [properties]
  );
  const recentInquiries = inquiries.slice(0, 3); // already newest first
  const recentNotifications = useMemo(
    () => [...notifications].sort(byNewest((n) => n.createdAt)).slice(0, 3),
    [notifications]
  );

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

      <div className="my-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <section>
        <SectionHeader title="Recent Properties" to={OWNER_PATHS.properties} />
        <DataTable
          columns={ownerPropertyColumns}
          rows={recentProperties}
          getRowKey={(p) => p.id}
          empty={emptyText(TEXT.noProperties)}
        />
      </section>

      <section className="mt-8">
        <SectionHeader title="Recent Inquiries" to={OWNER_PATHS.inquiries} />
        <DataTable
          columns={inquiryColumns}
          rows={recentInquiries}
          getRowKey={(i) => i.id}
          onRowClick={(i) => navigate(ownerInquiryPath(i.id))}
          empty={emptyText(TEXT.noInquiries)}
        />
      </section>

      <section className="mt-8">
        <SectionHeader title="Recent Notifications" to={OWNER_PATHS.notifications} />
        {recentNotifications.length === 0 ? (
          emptyText(TEXT.noNotifications)
        ) : (
          <RecentNotifications items={recentNotifications} />
        )}
      </section>
    </section>
  );
}
