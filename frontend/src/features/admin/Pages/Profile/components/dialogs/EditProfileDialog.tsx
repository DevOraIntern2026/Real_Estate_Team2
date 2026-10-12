import { useState } from "react";
import DialogActions from "../../../../components/shared/DialogActions";
import Modal from "../../../../components/shared/Modal";
import TextField from "../../../../components/shared/TextField";
import type { AdminProfile, EditableAdminFields } from "../../../../../../types/admin";
import { TEXT } from "../../constants";
import { isValidEmail, isValidPhone } from "../../validation";

type EditProfileDialogProps = {
  open: boolean;
  admin: AdminProfile;
  onCancel: () => void;
  onSave: (values: EditableAdminFields) => void;
};

export default function EditProfileDialog({
  open,
  admin,
  onCancel,
  onSave,
}: EditProfileDialogProps) {
  return (
    <Modal open={open} title={TEXT.editProfile} onClose={onCancel}>
      <EditForm admin={admin} onCancel={onCancel} onSave={onSave} />
    </Modal>
  );
}

// own component = own state, starts fresh every time the dialog opens
function EditForm({
  admin,
  onCancel,
  onSave,
}: Omit<EditProfileDialogProps, "open">) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [phone, setPhone] = useState(admin.phone);

  const nameOk = name.trim() !== "";
  const emailOk = isValidEmail(email);
  const phoneOk = isValidPhone(phone);
  const changed =
    name.trim() !== admin.name ||
    email.trim() !== admin.email ||
    phone.trim() !== admin.phone;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      }}
      className="mt-5 space-y-4"
    >
      <TextField
        label="Name"
        value={name}
        onChange={setName}
        autoComplete="name"
        error={nameOk ? undefined : "Name is required"}
      />
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
        error={emailOk ? undefined : "Enter a valid email address"}
      />
      <TextField
        label="Phone"
        type="tel"
        value={phone}
        onChange={setPhone}
        autoComplete="tel"
        error={phoneOk ? undefined : "Enter a valid phone number"}
      />
      <DialogActions
        submit
        confirmLabel={TEXT.editProfile}
        confirmDisabled={!(nameOk && emailOk && phoneOk && changed)}
        onCancel={onCancel}
      />
    </form>
  );
}
