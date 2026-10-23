export type ProfileDialog = "edit" | "photo" | "password" | "logout" | "delete" | "success";

export const MAX_PHOTO_MB = 5;

export const TEXT = {
  title: "Profile",
  settings: "Settings",
  editProfile: "Edit Profile",
  profileSection: "Profile",
  securitySection: "Security",
  changePhoto: "Change Photo",
  changePassword: "Change Password",
  logout: "Logout",
  logoutTitle: "Log out of DevOra?",
  logoutMessage: "You'll need to sign in again to access the admin dashboard.",
  deleteAccount: "Delete Account",
  deleteTitle: "Delete Account of DevOra?",
  deleteMessage:
    "This can't be undone. You'll need to create a new account to register on DevOra again.",
  roleLabel: "Role",
  photoHint: "Optimal dimensions 300x330",
  choosePhoto: "Choose From Gallery",
  photoTypeError: "Please choose an image file.",
  photoSizeError: `Image must be smaller than ${MAX_PHOTO_MB} MB.`,
  passwordSuccess: "Password Change Successfully",
};
