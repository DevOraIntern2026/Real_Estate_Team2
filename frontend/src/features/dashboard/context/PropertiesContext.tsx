import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { propertyDetailsMock } from "../data/propertyDetails.mock";
import type {
  Classification,
  PropertyDetails,
  Rejection,
} from "../../../types/property";

type PropertiesContextValue = {
  properties: PropertyDetails[];
  getPropertyById: (id: string) => PropertyDetails | undefined;
  getPropertiesByOwner: (ownerId: string) => PropertyDetails[];
  approveProperty: (id: string, classification: Classification) => void;
  rejectProperty: (id: string, rejection: Rejection) => void;
  deactivateProperty: (id: string) => void;
};

const PropertiesContext = createContext<PropertiesContextValue | null>(null);

/**
 * Shared source of truth for listings: the user profile, the details page
 * and (later) the Listing page all read the same data, so approving a
 * listing updates everywhere. Swap useState for your API later.
 */
export function PropertiesProvider({
  children,
  initialProperties = propertyDetailsMock,
}: {
  children: ReactNode;
  initialProperties?: PropertyDetails[];
}) {
  const [properties, setProperties] =
    useState<PropertyDetails[]>(initialProperties);

  const patch = useCallback((id: string, changes: Partial<PropertyDetails>) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...changes, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const approveProperty = useCallback(
    (id: string, c: Classification) =>
      patch(id, {
        status: "Published",
        type: c.type,
        category: c.category,
        rejection: undefined,
      }),
    [patch]
  );

  const rejectProperty = useCallback(
    (id: string, rejection: Rejection) =>
      patch(id, { status: "Rejected", rejection }),
    [patch]
  );

  const deactivateProperty = useCallback(
    (id: string) => patch(id, { status: "Inactive" }),
    [patch]
  );

  const getPropertyById = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties]
  );

  const getPropertiesByOwner = useCallback(
    (ownerId: string) => properties.filter((p) => p.ownerId === ownerId),
    [properties]
  );

  const value = useMemo(
    () => ({
      properties,
      getPropertyById,
      getPropertiesByOwner,
      approveProperty,
      rejectProperty,
      deactivateProperty,
    }),
    [
      properties,
      getPropertyById,
      getPropertiesByOwner,
      approveProperty,
      rejectProperty,
      deactivateProperty,
    ]
  );

  return (
    <PropertiesContext.Provider value={value}>
      {children}
    </PropertiesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProperties() {
  const ctx = useContext(PropertiesContext);
  if (!ctx) throw new Error("useProperties must be used inside <PropertiesProvider>");
  return ctx;
}
