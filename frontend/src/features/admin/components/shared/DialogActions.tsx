import Button from "./Button";

type DialogActionsProps = {
  confirmLabel: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  /** true when the buttons live inside a <form> */
  submit?: boolean;
  disabled?: boolean;
  confirmDisabled?: boolean;
};

export default function DialogActions({
  confirmLabel,
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
  submit = false,
  disabled = false,
  confirmDisabled = false,
}: DialogActionsProps) {
  return (
    <div className="mt-6 flex gap-3">
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={disabled}
        className="flex-1"
      >
        {cancelLabel}
      </Button>
      <Button
        variant="solid"
        type={submit ? "submit" : "button"}
        onClick={onConfirm}
        disabled={disabled || confirmDisabled}
        className="flex-1"
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
