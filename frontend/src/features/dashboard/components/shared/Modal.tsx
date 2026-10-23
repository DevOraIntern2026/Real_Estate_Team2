import { useEffect, useId, useRef, type ReactNode } from "react";

type ModalSize = "sm" | "md" | "lg";

const sizes: Record<ModalSize, string> = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
};

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  /** id of the element that describes the dialog (for screen readers) */
  describedBy?: string;
  /** false = title is hidden visually but still announced */
  showTitle?: boolean;
  /** false = no X button (e.g. success dialog) */
  showClose?: boolean;
  size?: ModalSize;
  children: ReactNode;
};

/**
 * Base dialog shell built on the native <dialog>:
 * focus trap, ESC key and backdrop come for free.
 * Children are only mounted while open, so forms reset every time.
 */
export default function Modal({
  open,
  title,
  onClose,
  describedBy,
  showTitle = true,
  showClose = true,
  size = "lg",
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      onCancel={(e) => {
        e.preventDefault(); // ESC: let the parent decide
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // click on backdrop
      }}
      className={`m-auto w-[calc(100%-2rem)] ${sizes[size]} rounded-sm border-[0.8px] border-[#87400E]/30 bg-[#FFFAF5] p-0 text-[#241A12] shadow-lg backdrop:bg-black/40`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h2
            id={titleId}
            className={showTitle ? "text-sm font-medium" : "sr-only"}
          >
            {title}
          </h2>
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="ms-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#F3E9E0] text-[#87400E]"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
        {open && children}
      </div>
    </dialog>
  );
}
