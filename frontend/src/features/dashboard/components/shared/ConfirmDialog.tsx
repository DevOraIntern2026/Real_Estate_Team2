import { useId, type ReactNode } from "react";
import DialogActions from "./DialogActions";
import Modal from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: ReactNode; // string or JSX (e.g. with a <strong> name)
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const messageId = useId();

  return (
    <Modal open={open} title={title} onClose={onCancel} describedBy={messageId}>
      <p id={messageId} className="mt-3 text-sm text-[#5A4F49]">
        {message}
      </p>
      <DialogActions
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onCancel={onCancel}
        onConfirm={onConfirm}
        disabled={isLoading}
      />
    </Modal>
  );
}
