import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { adminMock } from "../data/admin.mock";
import { changePasswordRequest, deleteAccountRequest } from "../services/adminApi";
import type { AdminProfile, EditableAdminFields } from "../../../types/admin";
import { AdminContext, type AdminSession } from "./AdminContext";

/**
 * The OLD in-memory session (fake data). Still used by the OWNER dashboard until its API is ready,
 * and by tests of pages that only need "some logged-in user". Delete it when the owner is integrated.
 */
export function MockSessionProvider({
  children,
  initialAdmin = adminMock,
}: {
  children: ReactNode;
  initialAdmin?: AdminProfile;
}) {
  const [admin, setAdmin] = useState<AdminProfile>(initialAdmin);
  const avatarUrl = useRef<string | undefined>(undefined);

  const updateProfile = useCallback(async (changes: Partial<EditableAdminFields>) => {
    setAdmin((prev) => ({ ...prev, ...changes }));
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    if (avatarUrl.current?.startsWith("blob:")) URL.revokeObjectURL(avatarUrl.current);
    const url = URL.createObjectURL(file);
    avatarUrl.current = url;
    setAdmin((prev) => ({ ...prev, avatar: url }));
  }, []);

  const changePassword = useCallback(
    (current: string, next: string) => changePasswordRequest(current, next),
    []
  );
  const deleteAccount = useCallback(() => deleteAccountRequest(), []);
  const logout = useCallback(() => {}, []);

  const value = useMemo<AdminSession>(
    () => ({ admin, updateProfile, uploadAvatar, changePassword, deleteAccount, logout }),
    [admin, updateProfile, uploadAvatar, changePassword, deleteAccount, logout]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
