import { useEffect } from "react";
import Modal from "./Modal";

type SuccessDialogProps = {
  open: boolean;
  message: string;
  onClose: () => void;
  autoCloseMs?: number;
};

/** Big green check + message. Closes itself after `autoCloseMs`. */
export default function SuccessDialog({
  open,
  message,
  onClose,
  autoCloseMs = 2500,
}: SuccessDialogProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(timer);
  }, [open, onClose, autoCloseMs]);

  return (
    <Modal
      open={open}
      title="Success"
      onClose={onClose}
      showTitle={false}
      showClose={false}
      size="sm"
    >
      <div className="flex flex-col items-center gap-4 pb-2 pt-2 text-center">
        <span className="flex h-28 w-28 items-center justify-center rounded-full bg-green-500 text-5xl text-white">
          <i className="fa-solid fa-check" aria-hidden="true" />
        </span>
        <p role="status" className="text-sm font-medium">
          {message}
        </p>
      </div>
    </Modal>
  );
}
