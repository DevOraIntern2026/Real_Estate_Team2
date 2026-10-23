import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { getErrorMessage, tokenStorage } from "../api";
import ErrorState from "../components/shared/ErrorState";
import LoadingState from "../components/shared/LoadingState";
import {
  changeAdminPassword,
  fetchAdminProfile,
  updateAdminProfile,
  uploadAdminPhoto,
} from "../services/adminProfileApi";
import { normalizeAdminProfile } from "../services/adminProfileMapper";
import type { AdminProfile, EditableAdminFields } from "../../../types/admin";

/** What every page/sidebar sees. Implemented by AdminProvider (API) and MockSessionProvider (owner, for now). */
export interface AdminSession {
  admin: AdminProfile;
  updateProfile: (changes: Partial<EditableAdminFields>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (current: string, next: string, confirm: string) => Promise<void>;
  /** only the owner dashboard has it (admin can't delete the account) */
  deleteAccount?: () => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AdminContext = createContext<AdminSession | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAdmin(): AdminSession {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export const adminProfileKey = ["admin", "profile"] as const;

function Gate({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-2xl p-8">{children}</div>;
}

/**
 * Loads the logged-in admin from the API. The pages below it can rely on `admin` always existing,
 * so while loading (or if it fails) the app shows a loading / error screen instead.
 * Put it INSIDE the admin layout (not at the app root) so the owner dashboard isn't blocked by it.
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: adminProfileKey,
    queryFn: async ({ signal }) => normalizeAdminProfile(await fetchAdminProfile(signal)),
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // wait for the refetch, so the UI already shows the new data when the dialog closes
  const refresh = useCallback(
    () => qc.invalidateQueries({ queryKey: adminProfileKey }),
    [qc]
  );

  const updateProfile = useCallback(
    async (changes: Partial<EditableAdminFields>) => {
      await updateAdminProfile(changes);
      await refresh();
    },
    [refresh]
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      await uploadAdminPhoto(file);
      await refresh();
    },
    [refresh]
  );

  const changePassword = useCallback(
    async (current: string, next: string, confirm: string) => {
      await changeAdminPassword(current, next, confirm);
    },
    []
  );

  // TODO: if your API has a logout endpoint, call it here first
  const logout = useCallback(() => {
    tokenStorage.clear();
    qc.clear();
  }, [qc]);

  const value = useMemo<AdminSession | null>(
    () =>
      query.data
        ? { admin: query.data, updateProfile, uploadAvatar, changePassword, logout }
        : null,
    [query.data, updateProfile, uploadAvatar, changePassword, logout]
  );

  if (query.isPending) {
    return (
      <Gate>
        <LoadingState rows={4} />
      </Gate>
    );
  }

  if (query.isError || !value) {
    return (
      <Gate>
        <ErrorState
          message={getErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isRefetching}
        />
      </Gate>
    );
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
