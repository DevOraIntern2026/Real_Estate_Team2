import { useState } from "react";
import { useProperties } from "../../context/PropertiesContext";
import type { Classification, PropertyDetails } from "../../../../types/property";

export type DialogKind = "classify" | "approve" | "reject" | "deactivate";

/**
 * One state machine for all the dialogs:
 * classify -> approve (2 steps), reject, deactivate.
 */
export function useDecisionFlow(property: PropertyDetails) {
  const { approveProperty, rejectProperty, deactivateProperty } = useProperties();

  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [classification, setClassification] = useState<Classification>({
    type: property.type,
    category: property.category ?? "Residential",
  });

  const close = () => setDialog(null);

  const submitClassification = (c: Classification) => {
    setClassification(c);
    setDialog("approve"); // go to the final confirmation
  };

  const confirmApprove = () => {
    approveProperty(property.id, classification);
    close();
  };

  const submitReject = (rejection: { reason: string; feedback: string }) => {
    rejectProperty(property.id, rejection);
    close();
  };

  const confirmDeactivate = () => {
    deactivateProperty(property.id);
    close();
  };

  return {
    dialog,
    open: setDialog,
    close,
    classification,
    submitClassification,
    confirmApprove,
    submitReject,
    confirmDeactivate,
  };
}
