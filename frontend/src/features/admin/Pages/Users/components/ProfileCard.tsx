import DetailList from "../../../components/shared/DetailList";
import InfoCard from "../../../components/shared/InfoCard";
import StatusBadge from "../../../components/shared/StatusBadge";
import { formatDate } from "../../../utils/formatDate";
import { STATUS_TONE } from "../constants";
import type { User } from "../types";

export default function ProfileCard({ user }: { user: User }) {
  return (
    <InfoCard title="Profile">
      <DetailList
        items={[
          {
            label: "Status",
            value: (
              <StatusBadge
                label={user.status}
                tone={STATUS_TONE[user.status]}
              />
            ),
          },
          { label: "Phone", value: user.phone },
          { label: "Location", value: user.location },
          { label: "Joined", value: formatDate(user.joined) },
        ]}
      />
    </InfoCard>
  );
}
