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

type ProfileProps = {
  /** show the read-only Role field (owner) */
  showRole?: boolean;
  /** show the Delete Account button + dialog (owner) */
  allowDelete?: boolean;
};

/** One page for both dashboards. Admin: <Profile />   Owner: <Profile showRole allowDelete /> */
export default function Profile({ showRole = false, allowDelete = false }: ProfileProps) {
  const navigate = useNavigate();
  const { admin, updateAdmin, setAvatarFile, changePassword, deleteAccount, logout } =
    useAdmin();

  // only one dialog is open at a time
  const [dialog, setDialog] = useState<ProfileDialog | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const close = () => {
    setDialog(null);
    setDeleteError(null);
  };
  // don't let the user dismiss the delete dialog while the request is running
  const closeDelete = () => {
    if (!deleting) close();
  };

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

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      logout();
      setDialog(null);
      navigate(LOGIN_PATH, { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setDeleting(false);
    }
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
        <ProfileDetails
          admin={admin}
          showRole={showRole}
          onChangePhoto={() => setDialog("photo")}
        />
        <SecuritySection
          onChangePassword={() => setDialog("password")}
          onLogout={() => setDialog("logout")}
          onDeleteAccount={allowDelete ? () => setDialog("delete") : undefined}
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
      {allowDelete && (
        <ConfirmDialog
          open={dialog === "delete"}
          title={TEXT.deleteTitle}
          message={
            <>
              {TEXT.deleteMessage}
              {deleteError && (
                <span role="alert" className="mt-2 block text-red-500">
                  {deleteError}
                </span>
              )}
            </>
          }
          confirmLabel={TEXT.deleteAccount}
          isLoading={deleting}
          onConfirm={handleDelete}
          onCancel={closeDelete}
        />
      )}
      <SuccessDialog
        open={dialog === "success"}
        message={TEXT.passwordSuccess}
        onClose={close}
      />
    </section>
  );
}
