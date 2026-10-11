import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/shared/Button";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import PageHeader from "../../components/shared/PageHeader";
import SuccessDialog from "../../components/shared/SuccessDialog";
import { LOGIN_PATH } from "../../constants/paths";
import { useAdmin } from "../../context/AdminContext";
import ChangePasswordDialog from "./components/dialogs/ChangePasswordDialog";
import ChangePhotoDialog from "./components/dialogs/ChangePhotoDialog";
import EditProfileDialog from "./components/dialogs/EditProfileDialog";
import ProfileDetails from "./components/ProfileDetails";
import SecuritySection from "./components/SecuritySection";
import { TEXT, type ProfileDialog } from "./constants";

export default function Profile() {
  const navigate = useNavigate();
  const { admin, updateAdmin, setAvatarFile, changePassword, logout } = useAdmin();

  // only one dialog is open at a time
  const [dialog, setDialog] = useState<ProfileDialog | null>(null);
  const close = () => setDialog(null);

  const handleSave = (values: Parameters<typeof updateAdmin>[0]) => {
    updateAdmin(values);
    close();
  };

  const handlePhoto = (file: File) => {
    setAvatarFile(file);
    close();
  };

  const handlePassword = async (current: string, next: string) => {
    await changePassword(current, next); // throws -> message shows inside the dialog
    setDialog("success");
  };

  const handleLogout = () => {
    logout();
    close();
    navigate(LOGIN_PATH, { replace: true });
  };

  return (
    <section className="p-8 text-[#241A12]">
      <PageHeader title={TEXT.title} />

      <div className="my-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-medium">{TEXT.settings}</h2>
        <Button onClick={() => setDialog("edit")} className="w-full sm:w-64">
          {TEXT.editProfile}
        </Button>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <ProfileDetails admin={admin} onChangePhoto={() => setDialog("photo")} />
        <SecuritySection
          onChangePassword={() => setDialog("password")}
          onLogout={() => setDialog("logout")}
        />
      </div>

      <EditProfileDialog
        open={dialog === "edit"}
        admin={admin}
        onCancel={close}
        onSave={handleSave}
      />
      <ChangePhotoDialog
        open={dialog === "photo"}
        admin={admin}
        onCancel={close}
        onPick={handlePhoto}
      />
      <ChangePasswordDialog
        open={dialog === "password"}
        onCancel={close}
        onSubmit={handlePassword}
      />
      <ConfirmDialog
        open={dialog === "logout"}
        title={TEXT.logoutTitle}
        message={TEXT.logoutMessage}
        confirmLabel={TEXT.logout}
        onConfirm={handleLogout}
        onCancel={close}
      />
      <SuccessDialog
        open={dialog === "success"}
        message={TEXT.passwordSuccess}
        onClose={close}
      />
    </section>
  );
}
