import type { PropertyStatus } from "../../../types/property";

const KNOWN_STATUSES: PropertyStatus[] = [
  "Under Review",
  "Published",
  "Rejected",
  "Change Required",
  "Inactive",
  "Sold/Rented",
];

/** "under_review" -> "Under Review", "villa" -> "Villa" */
export function prettify(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** The UI status for an API value ("under_review" -> "Under Review"), or undefined if unknown. */
export function toPropertyStatus(apiStatus: string): PropertyStatus | undefined {
  const pretty = prettify(apiStatus);
  // the API says "sold_rented", the UI says "Sold/Rented"
  if (pretty === "Sold Rented") return "Sold/Rented";
  return KNOWN_STATUSES.find((s) => s === pretty);
}

/** 16000 + "EGP" + "rent" -> "16,000/Mo EGP", sale -> "16,000 EGP" */
export function formatPriceLabel(price: number, currency: string, transaction?: string): string {
  const amount = price.toLocaleString("en-US");
  return transaction?.toLowerCase() === "rent" ? `${amount}/Mo ${currency}` : `${amount} ${currency}`;
}
