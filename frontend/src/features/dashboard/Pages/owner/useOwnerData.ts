import { useMemo } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useProperties } from "../../context/PropertiesContext";

/** The owner's properties (still the mock PropertiesContext: used by Reports until it is integrated). */
export function useOwnerData() {
  const { admin: owner } = useAdmin();
  const { getPropertiesByOwner } = useProperties();

  const properties = useMemo(
    () => getPropertiesByOwner(owner.id),
    [getPropertiesByOwner, owner.id]
  );

  return { owner, properties };
}
