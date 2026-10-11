import { Link } from "react-router-dom";
import type { Column } from "../../components/shared/DataTable";
import StatusBadge from "../../components/shared/StatusBadge";
import { formatDate } from "../../utils/formatDate";
import { STATUS_TONE } from "./constants";
import { userProfilePath } from "./paths";
import type { User } from "./types";

export const userColumns: Column<User>[] = [
  {
    key: "name",
    header: "User Name",
    render: (u) => (
      // a real link = keyboard accessible + "open in new tab" works.
      // stopPropagation so the row's onClick doesn't navigate a second time.
      <Link
        to={userProfilePath(u.id)}
        onClick={(e) => e.stopPropagation()}
        className="font-medium hover:underline"
      >
        {u.name}
      </Link>
    ),
  },
  { key: "role", header: "Role", render: (u) => u.role },
  { key: "email", header: "E-mail", render: (u) => u.email },
  { key: "listings", header: "Listings", render: (u) => u.listings },
  { key: "phone", header: "Phone", render: (u) => u.phone },
  {
    key: "status",
    header: "Status",
    render: (u) => <StatusBadge label={u.status} tone={STATUS_TONE[u.status]} />,
  },
  { key: "joined", header: "Joined", render: (u) => formatDate(u.joined) },
];
