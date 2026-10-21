import { useState } from "react";
import DialogActions from "../../../../components/shared/DialogActions";
import Modal from "../../../../components/shared/Modal";
import TextField from "../../../../components/shared/TextField";
import { getErrorMessage } from "../../../../api";
import type { AdminProfile, EditableAdminFields } from "../../../../../../types/admin";
import { TEXT } from "../../constants";
import { isValidEmail, isValidPhone } from "../../validation";

type EditProfileDialogProps = {
  open: boolean;
  admin: AdminProfile;
  onCancel: () => void;
  /** reject / throw to show the server's message inside the dialog */
  onSave: (values: EditableAdminFields) => Promise<void>;
};

export default function EditProfileDialog({ open, admin, onCancel, onSave }: EditProfileDialogProps) {
  return (
    <Modal open={open} title={TEXT.editProfile} onClose={onCancel}>
      <EditForm admin={admin} onCancel={onCancel} onSave={onSave} />
    </Modal>
  );
}

// own component = own state, starts fresh every time the dialog opens
function EditForm({ admin, onCancel, onSave }: Omit<EditProfileDialogProps, "open">) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [phone, setPhone] = useState(admin.phone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameOk = name.trim() !== "";
  const emailOk = isValidEmail(email);
  const phoneOk = isValidPhone(phone);
  const changed =
    name.trim() !== admin.name || email.trim() !== admin.email || phone.trim() !== admin.phone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <TextField label="Name" value={name} onChange={setName} autoComplete="name"
        error={nameOk ? undefined : "Name is required"} />
      <TextField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email"
        error={emailOk ? undefined : "Enter a valid email address"} />
      <TextField label="Phone" type="tel" value={phone} onChange={setPhone} autoComplete="tel"
        error={phoneOk ? undefined : "Enter a valid phone number"} />

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <DialogActions
        submit
        confirmLabel={loading ? "Saving…" : TEXT.editProfile}
        confirmDisabled={!(nameOk && emailOk && phoneOk && changed)}
        disabled={loading}
        onCancel={onCancel}
      />
    </form>
  );
}
