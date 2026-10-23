import { expect, test } from "vitest";
import { normalizePaginated } from "../../api";
import { getPageItems } from "../../components/shared/paginationItems";
import { formatPriceLabel, toPropertyStatus } from "../../utils/labels";
import { normalizeCounts, normalizeFilters } from "./mappers";

const req = { page: 2, limit: 10 };

test("normalizePaginated: every common shape", () => {
  expect(normalizePaginated<number>([1, 2, 3], req)).toMatchObject({ items: [1, 2, 3], total: 13, page: 2, totalPages: 2 });
  expect(normalizePaginated<number>({ data: [1], meta: { total: 45, page: 3, limit: 10, totalPages: 5 } }, req))
    .toMatchObject({ total: 45, page: 3, totalPages: 5 });
  expect(normalizePaginated<number>({ items: [1], total: 45, page: 1, limit: 10 }, req))
    .toMatchObject({ total: 45, totalPages: 5 });
  expect(normalizePaginated<number>({ listings: [1], pagination: { totalItems: 21, pageSize: 10, currentPage: 1, pages: 3 } }, req))
    .toMatchObject({ total: 21, totalPages: 3, limit: 10 });
  expect(() => normalizePaginated({ nothing: 1 }, req)).toThrow("Unexpected response");
});

test("normalizeCounts: snake, camel, wrapped, array, missing keys", () => {
  expect(normalizeCounts({ all: 5, under_review: 2 })).toMatchObject({ all: 5, under_review: 2, published: 0 });
  expect(normalizeCounts({ counts: { underReview: 4, soldRented: 1 } })).toMatchObject({ under_review: 4, sold_rented: 1 });
  expect(normalizeCounts([{ status: "published", count: 7 }])).toMatchObject({ published: 7 });
  expect(normalizeCounts(null).all).toBe(0);
});

test("normalizeFilters: strings or objects, several key names", () => {
  const f = normalizeFilters({ propertyTypes: ["villa", "duplex"], locations: [{ value: "m", label: "Maadi" }, "Giza"] });
  expect(f.types).toEqual([{ value: "villa", label: "Villa" }, { value: "duplex", label: "Duplex" }]);
  expect(f.locations).toEqual([{ value: "m", label: "Maadi" }, { value: "Giza", label: "Giza" }]);
  expect(normalizeFilters(undefined)).toEqual({ types: [], locations: [] });
});

test("labels", () => {
  expect(toPropertyStatus("sold_rented")).toBe("Sold/Rented");
  expect(toPropertyStatus("change_required")).toBe("Change Required");
  expect(toPropertyStatus("whatever")).toBeUndefined();
  expect(formatPriceLabel(16000, "EGP", "rent")).toBe("16,000/Mo EGP");
  expect(formatPriceLabel(4500000, "EGP", "sale")).toBe("4,500,000 EGP");
});

test("getPageItems: windowed with ellipsis", () => {
  expect(getPageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
  expect(getPageItems(1, 20)).toEqual([1, 2, 3, 4, "…", 20]);
  expect(getPageItems(10, 20)).toEqual([1, "…", 9, 10, 11, "…", 20]);
  expect(getPageItems(20, 20)).toEqual([1, "…", 17, 18, 19, 20]);
});
