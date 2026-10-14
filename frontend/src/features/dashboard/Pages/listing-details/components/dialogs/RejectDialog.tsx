import { useState } from "react";
import DialogActions from "../../../../components/shared/DialogActions";
import Modal from "../../../../components/shared/Modal";
import TextField from "../../../../components/shared/TextField";
import { TEXT } from "../../constants";

type RejectValues = { reason: string; feedback: string };

type RejectDialogProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: RejectValues) => void;
};

export default function RejectDialog({
  open,
  onCancel,
  onSubmit,
}: RejectDialogProps) {
  return (
    <Modal open={open} title={TEXT.rejectTitle} onClose={onCancel}>
      <RejectForm onCancel={onCancel} onSubmit={onSubmit} />
    </Modal>
  );
}

function RejectForm({ onCancel, onSubmit }: Omit<RejectDialogProps, "open">) {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ reason: reason.trim(), feedback: feedback.trim() });
      }}
      className="mt-5 space-y-4"
    >
      <TextField
        label={TEXT.reasonLabel}
        value={reason}
        onChange={setReason}
        placeholder={TEXT.reasonPlaceholder}
        required
      />
      <TextField
        label={TEXT.feedbackLabel}
        value={feedback}
        onChange={setFeedback}
        placeholder={TEXT.feedbackPlaceholder}
        multiline
      />
      <DialogActions
        submit
        confirmLabel={TEXT.rejectConfirm}
        confirmDisabled={reason.trim() === ""}
        onCancel={onCancel}
      />
    </form>
  );
}
