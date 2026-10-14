import { useMemo } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useInquiries } from "../../context/InquiriesContext";
import { useProperties } from "../../context/PropertiesContext";
import type { InquiryRow } from "../../types/inquiry";

/** Everything that belongs to the logged-in owner. */
export function useOwnerData() {
  const { admin: owner } = useAdmin();
  const { getPropertiesByOwner } = useProperties();
  const { inquiries } = useInquiries();

  const properties = useMemo(
    () => getPropertiesByOwner(owner.id),
    [getPropertiesByOwner, owner.id]
  );

  // keep only inquiries about MY properties, newest first
  const inquiryRows = useMemo<InquiryRow[]>(() => {
    const byId = new Map(properties.map((p) => [p.id, p]));
    return inquiries
      .flatMap((i) => {
        const property = byId.get(i.propertyId);
        return property ? [{ ...i, property }] : [];
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [inquiries, properties]);

  return { owner, properties, inquiries: inquiryRows };
}
