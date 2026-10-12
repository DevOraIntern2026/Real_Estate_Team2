import Button from "../../../components/shared/Button";
import InfoCard from "../../../components/shared/InfoCard";
import StatusBadge from "../../../components/shared/StatusBadge";
import { PROPERTY_STATUS_TONE } from "../../../components/properties/propertyColumns";
import type { PropertyStatus, Rejection } from "../../../../../types/property";
import { ACTION_UI, DECISION_ACTIONS, type DecisionActionKind } from "../constants";

type DecisionPanelProps = {
  status: PropertyStatus;
  rejection?: Rejection;
  onAction: (kind: DecisionActionKind) => void;
};

export default function DecisionPanel({
  status,
  rejection,
  onAction,
}: DecisionPanelProps) {
  const actions = DECISION_ACTIONS[status];

  return (
    <InfoCard title="Decision Panel">
      <div className="flex items-center gap-2 text-sm text-[#5A4F49]">
        Current status
        <StatusBadge label={status} tone={PROPERTY_STATUS_TONE[status]} />
      </div>

      {status === "Rejected" && rejection && (
        <p className="mt-3 text-xs text-[#5A4F49]">
          Reason: {rejection.reason}
          {rejection.feedback ? ` — ${rejection.feedback}` : ""}
        </p>
      )}

      {actions.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {actions.map((kind) => (
            <Button
              key={kind}
              variant={ACTION_UI[kind].variant}
              onClick={() => onAction(kind)}
              className="w-full"
            >
              {ACTION_UI[kind].label}
            </Button>
          ))}
        </div>
      )}
    </InfoCard>
  );
}
