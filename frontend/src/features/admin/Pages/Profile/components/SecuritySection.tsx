import Button from "../../../components/shared/Button";
import { TEXT } from "../constants";
import SettingsSection from "./SettingsSection";

type SecuritySectionProps = {
  onChangePassword: () => void;
  onLogout: () => void;
};

export default function SecuritySection({
  onChangePassword,
  onLogout,
}: SecuritySectionProps) {
  return (
    <SettingsSection title={TEXT.securitySection}>
      <button
        type="button"
        onClick={onChangePassword}
        className="flex w-full items-center justify-between py-2 text-sm text-[#241A12]"
      >
        <span className="underline">{TEXT.changePassword}</span>
        <i className="fa-solid fa-chevron-right text-xs rtl:rotate-180" />
      </button>

      <Button onClick={onLogout} className="mt-4 w-full">
        {TEXT.logout}
      </Button>
    </SettingsSection>
  );
}
