import Button from "../../../components/shared/Button";
import { TEXT } from "../constants";
import SettingsSection from "./SettingsSection";

type SecuritySectionProps = {
  onChangePassword: () => void;
  onLogout: () => void;
  /** pass it to show the "Delete Account" button (owner design) */
  onDeleteAccount?: () => void;
};

export default function SecuritySection({
  onChangePassword,
  onLogout,
  onDeleteAccount,
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

      <div className="mt-4 flex flex-col gap-3">
        {onDeleteAccount && (
          <Button variant="outline" onClick={onDeleteAccount} className="w-full">
            {TEXT.deleteAccount}
          </Button>
        )}
        <Button onClick={onLogout} className="w-full">
          {TEXT.logout}
        </Button>
      </div>
    </SettingsSection>
  );
}
