import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { adminMock } from "../data/admin.mock";
import { changePasswordRequest, deleteAccountRequest } from "../services/adminApi";
import type { AdminProfile, EditableAdminFields } from "../../../types/admin";

type AdminContextValue = {
  admin: AdminProfile;
  updateAdmin: (changes: Partial<EditableAdminFields>) => void;
  setAvatarFile: (file: File) => void;
  changePassword: (current: string, next: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

/** The logged-in person (admin OR owner). Wrap it ABOVE the router. */
export function AdminProvider({
  children,
  initialAdmin = adminMock,
}: {
  children: ReactNode;
  initialAdmin?: AdminProfile;
}) {
  const [admin, setAdmin] = useState<AdminProfile>(initialAdmin);
  const avatarUrl = useRef<string | undefined>(undefined);

  const updateAdmin = useCallback((changes: Partial<EditableAdminFields>) => {
    setAdmin((prev) => ({ ...prev, ...changes }));
  }, []);

  // TODO: upload the file to your API and store the returned URL instead
  const setAvatarFile = useCallback((file: File) => {
    if (avatarUrl.current?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarUrl.current);
    }
    const url = URL.createObjectURL(file);
    avatarUrl.current = url;
    setAdmin((prev) => ({ ...prev, avatar: url }));
  }, []);

  const changePassword = useCallback(
    (current: string, next: string) => changePasswordRequest(current, next),
    []
  );

  const deleteAccount = useCallback(() => deleteAccountRequest(), []);

  // TODO: clear your token / session here
  const logout = useCallback(() => {}, []);

  const value = useMemo(
    () => ({ admin, updateAdmin, setAvatarFile, changePassword, deleteAccount, logout }),
    [admin, updateAdmin, setAvatarFile, changePassword, deleteAccount, logout]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}
