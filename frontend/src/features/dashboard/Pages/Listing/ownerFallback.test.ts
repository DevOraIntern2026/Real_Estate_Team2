import { expect, test } from "vitest";
import { toListingRowVm } from "./mappers";

const dto = { id: "1", code: "D-1", title: "T", propertyType: "villa", transaction: "sale", area: "A", price: 1, currency: "EGP", status: "published", submittedAt: "2026-01-01" };

test("no owner in the DTO -> empty (or the given fallback), never an array index", () => {
  expect(toListingRowVm(dto).ownerName).toBe("");
  expect(toListingRowVm(dto, "Sara").ownerName).toBe("Sara");
  expect([dto, dto].map((d) => toListingRowVm(d)).map((r) => r.ownerName)).toEqual(["", ""]);
});
