import Avatar from "../../../components/shared/Avatar";
import { STATUS_ACTIONS } from "../constants";
import type { User } from "../types";

type UserSummaryProps = { user: User; onAction: () => void };

export default function UserSummary({ user, onAction }: UserSummaryProps) {
  // undefined when the server sends a status we don't have an action for -> no button
  const action = STATUS_ACTIONS[user.status];
  const solid = action?.buttonVariant === "solid";

  return (
    <div className="my-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Avatar name={user.name || user.email} src={user.avatar} className="h-14 w-14 text-base" />
        <div>
          <p className="font-medium text-[#241A12]">{user.name}</p>
          <p className="text-sm text-[#5A4F49]">
            {user.email} · {user.role}
          </p>
        </div>
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className={`w-full rounded-sm px-6 py-2 text-sm font-medium md:w-2/5 ${
            solid
              ? "bg-[#87400E] text-[#FAFAFA]"
              : "border-[0.8px] border-[#87400E] text-[#87400E]"
          }`}
        >
          {action.buttonLabel}
        </button>
      )}
    </div>
  );
}
