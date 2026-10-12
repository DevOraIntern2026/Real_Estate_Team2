import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usersMock } from "./users.mock";
import type { User, UserStatus } from "./types";

type UsersContextValue = {
  users: User[];
  getUserById: (id: string) => User | undefined;
  setUserStatus: (id: string, status: UserStatus) => void;
};

const UsersContext = createContext<UsersContextValue | null>(null);

/**
 * One shared source of truth for the list page AND the profile page,
 * so suspending a user in the profile is reflected in the table.
 * Later you can swap the useState for React Query / an API.
 */
export function UsersProvider({
  children,
  initialUsers = usersMock,
}: {
  children: ReactNode;
  initialUsers?: User[];
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const getUserById = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users]
  );

  const setUserStatus = useCallback((id: string, status: UserStatus) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
  }, []);

  const value = useMemo(
    () => ({ users, getUserById, setUserStatus }),
    [users, getUserById, setUserStatus]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used inside <UsersProvider>");
  return ctx;
}
