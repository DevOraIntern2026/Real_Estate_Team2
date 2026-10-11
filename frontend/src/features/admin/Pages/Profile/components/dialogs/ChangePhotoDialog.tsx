import { useRef, useState, type ChangeEvent } from "react";
import Avatar from "../../../../components/shared/Avatar";
import Button from "../../../../components/shared/Button";
import Modal from "../../../../components/shared/Modal";
import type { AdminProfile } from "../../../../../../types/admin";
import { MAX_PHOTO_MB, TEXT } from "../../constants";

type ChangePhotoDialogProps = {
  open: boolean;
  admin: AdminProfile;
  onCancel: () => void;
  onPick: (file: File) => void;
};

export default function ChangePhotoDialog({
  open,
  admin,
  onCancel,
  onPick,
}: ChangePhotoDialogProps) {
  return (
    <Modal
      open={open}
      title={TEXT.changePhoto}
      onClose={onCancel}
      showTitle={false}
      size="sm"
    >
      <PhotoBody admin={admin} onPick={onPick} />
    </Modal>
  );
}

function PhotoBody({
  admin,
  onPick,
}: Pick<ChangePhotoDialogProps, "admin" | "onPick">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the user pick the same file again later
    if (!file) return;

    if (!file.type.startsWith("image/")) return setError(TEXT.photoTypeError);
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setError(TEXT.photoSizeError);

    setError(null);
    onPick(file);
  };

  return (
    <div className="mt-4 flex flex-col items-center gap-3 text-center">
      {admin.avatar ? (
        <img
          src={admin.avatar}
          alt="Current profile"
          className="aspect-[300/330] w-full rounded-sm object-cover"
        />
      ) : (
        <Avatar
          name={admin.name}
          className="aspect-[300/330] h-auto w-full !rounded-sm text-6xl"
        />
      )}

      <p className="text-xs text-[#5A4F49]">{TEXT.photoHint}</p>
      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        data-testid="photo-input"
      />
      <Button onClick={() => inputRef.current?.click()} className="w-full">
        {TEXT.choosePhoto}
      </Button>
    </div>
  );
}
