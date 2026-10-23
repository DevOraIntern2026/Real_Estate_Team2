import Avatar from "../../../components/shared/Avatar";
import Button from "../../../components/shared/Button";
import TextField from "../../../components/shared/TextField";
import type { AdminProfile } from "../../../../../types/admin";
import { TEXT } from "../constants";
import SettingsSection from "./SettingsSection";

type ProfileDetailsProps = {
  admin: AdminProfile;
  onChangePhoto: () => void;
  /** owner design shows a read-only Role field */
  showRole?: boolean;
};

export default function ProfileDetails({
  admin,
  onChangePhoto,
  showRole = false,
}: ProfileDetailsProps) {
  return (
    <SettingsSection title={TEXT.profileSection}>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-3">
          <Avatar name={admin.name} src={admin.avatar} className="h-32 w-32 text-3xl" />
          <Button variant="text" onClick={onChangePhoto} className="text-[#241A12] underline">
            {TEXT.changePhoto}
          </Button>
        </div>

        <div className="w-full flex-1 space-y-4">
          <TextField label="Name" value={admin.name} readOnly />
          <TextField label="Email" value={admin.email} readOnly />
          <TextField label="Phone" value={admin.phone} readOnly />
          {showRole && <TextField label={TEXT.roleLabel} value={admin.role} readOnly />}
        </div>
      </div>
    </SettingsSection>
  );
}
