import { useState } from "react";
import DialogActions from "../../../../components/shared/DialogActions";
import Modal from "../../../../components/shared/Modal";
import SelectField from "../../../../components/shared/SelectField";
import type { Classification, PropertyCategory } from "../../../../../../types/property";
import { CATEGORY_OPTIONS, PROPERTY_TYPE_OPTIONS, TEXT } from "../../constants";

type ClassifyDialogProps = {
  open: boolean;
  initial: Classification;
  onCancel: () => void;
  onSubmit: (classification: Classification) => void;
};

export default function ClassifyDialog({
  open,
  initial,
  onCancel,
  onSubmit,
}: ClassifyDialogProps) {
  return (
    <Modal open={open} title={TEXT.classifyTitle} onClose={onCancel}>
      <ClassifyForm initial={initial} onCancel={onCancel} onSubmit={onSubmit} />
    </Modal>
  );
}

// separate component = its own state, reset every time the dialog opens
function ClassifyForm({
  initial,
  onCancel,
  onSubmit,
}: Omit<ClassifyDialogProps, "open">) {
  const [type, setType] = useState(initial.type);
  const [category, setCategory] = useState<PropertyCategory>(initial.category);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ type, category });
      }}
      className="mt-5 space-y-4"
    >
      <SelectField
        label="Property Types"
        value={type}
        options={PROPERTY_TYPE_OPTIONS}
        onChange={setType}
      />
      <SelectField
        label="Category"
        value={category}
        options={CATEGORY_OPTIONS}
        onChange={setCategory}
      />
      <DialogActions
        submit
        confirmLabel={TEXT.classifyConfirm}
        onCancel={onCancel}
      />
    </form>
  );
}
