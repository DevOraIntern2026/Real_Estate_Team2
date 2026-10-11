import { Link } from "react-router-dom";
import Avatar from "../../../components/shared/Avatar";
import DetailList from "../../../components/shared/DetailList";
import { userProfilePath } from "../../Users/paths";
import type { User } from "../../Users/types";
import InfoCard from "../../../components/shared/InfoCard";

export default function OwnerCard({ user }: { user: User }) {
  return (
    <InfoCard>
      <div className="flex items-center gap-3">
        <Avatar name={user.name} src={user.avatar} className="h-12 w-12 text-sm" />
        <div>
          <p className="font-medium text-[#241A12]">{user.name}</p>
          <p className="text-xs text-[#5A4F49]">{user.role}</p>
        </div>
      </div>

      <div className="mt-4">
        <DetailList
          items={[
            { label: "E-mail", value: user.email },
            { label: "Phone", value: user.phone },
            { label: "Location", value: user.location },
          ]}
        />
      </div>

      <Link
        to={userProfilePath(user.id)}
        className="mt-4 block rounded-sm bg-[#87400E] px-6 py-2 text-center text-sm font-medium text-[#FAFAFA]"
      >
        View Profile
      </Link>
    </InfoCard>
  );
}
