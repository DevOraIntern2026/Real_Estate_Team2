import { useState } from "react";
import DialogActions from "../../../../components/shared/DialogActions";
import Modal from "../../../../components/shared/Modal";
import PasswordField from "../../../../components/shared/PasswordField";
import { TEXT } from "../../constants";
import { getPasswordChecks } from "../../validation";
import PasswordChecklist from "../PasswordChecklist";

type ChangePasswordDialogProps = {
  open: boolean;
  onCancel: () => void;
  /** reject / throw an Error to show its message inside the dialog */
  onSubmit: (current: string, next: string) => Promise<void>;
};

export default function ChangePasswordDialog({
  open,
  onCancel,
  onSubmit,
}: ChangePasswordDialogProps) {
  return (
    <Modal open={open} title={TEXT.changePassword} onClose={onCancel}>
      <PasswordForm onCancel={onCancel} onSubmit={onSubmit} />
    </Modal>
  );
}

function PasswordForm({
  onCancel,
  onSubmit,
}: Omit<ChangePasswordDialogProps, "open">) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checks = getPasswordChecks(next);
  const rulesOk = checks.every((c) => c.passed);
  const matches = confirm === next;
  const canSubmit = current !== "" && rulesOk && confirm !== "" && matches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(current, next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <PasswordField
        label="Current Password"
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
      />
      <PasswordField
        label="New Password"
        value={next}
        onChange={setNext}
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirm New Password"
        value={confirm}
        onChange={setConfirm}
        autoComplete="new-password"
        error={confirm !== "" && !matches ? "Passwords do not match" : undefined}
      />

      <PasswordChecklist checks={checks} />

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <DialogActions
        submit
        confirmLabel="Update Password"
        confirmDisabled={!canSubmit}
        disabled={loading}
        onCancel={onCancel}
      />
    </form>
  );
}
