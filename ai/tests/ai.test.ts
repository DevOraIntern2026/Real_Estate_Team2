import test from "node:test";
import assert from "node:assert/strict";
import { validatePropertyPreferences, validateExtraction, parseJsonSafe } from "../src/validation.js";
import { mergePreferences, createConversationState } from "../src/context.js";
import { buildMessages } from "../src/prompt.js";

test("validate basic rent preferences", () => {
  const p = validatePropertyPreferences({
    transactionType: "rent",
    propertyType: "apartment",
    location: "New Cairo",
    minPrice: null,
    maxPrice: 20000,
    bedrooms: 2,
    bathrooms: null,
    minArea: null,
    maxArea: null,
    furnished: null,
    amenities: null,
    preferences: {},
  });
  assert.equal(p.transactionType, "rent");
  assert.equal(p.bedrooms, 2);
  assert.equal(p.maxPrice, 20000);
});

test("validateExtraction with clarification", () => {
  const e = validateExtraction({
    preferences: {
      transactionType: null,
      propertyType: "apartment",
      location: null,
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      bathrooms: null,
      minArea: null,
      maxArea: null,
      furnished: null,
      amenities: null,
      preferences: {},
    },
    needsClarification: true,
    clarificationQuestion: "Are you looking to rent or buy?",
  });
  assert.equal(e.needsClarification, true);
});

test("rejects invalid enum", () => {
  assert.throws(() =>
    validatePropertyPreferences({
      transactionType: "buy",
      propertyType: "apartment",
      location: null,
      minPrice: null,
      maxPrice: null,
      bedrooms: null,
      bathrooms: null,
      minArea: null,
      maxArea: null,
      furnished: null,
      amenities: null,
      preferences: {},
    })
  );
});

test("parseJsonSafe strips fences", () => {
  const v = parseJsonSafe("```json\n{\"a\":1}\n```");
  assert.deepEqual(v, { a: 1 });
});

test("mergePreferences keeps non-null", () => {
  let base = {
    transactionType: "rent" as const,
    propertyType: null,
    location: "New Cairo",
    minPrice: null,
    maxPrice: null,
    bedrooms: null,
    bathrooms: null,
    minArea: null,
    maxArea: null,
    furnished: null,
    amenities: null,
    preferences: {},
  };
  const inc = {
    transactionType: null,
    propertyType: "apartment" as const,
    location: null,
    minPrice: null,
    maxPrice: 20000,
    bedrooms: 2,
    bathrooms: null,
    minArea: null,
    maxArea: null,
    furnished: null,
    amenities: null,
    preferences: { parking: true },
  };
  const m = mergePreferences(base as any, inc);
  assert.equal(m.location, "New Cairo");
  assert.equal(m.propertyType, "apartment");
  assert.equal(m.maxPrice, 20000);
  assert.equal((m.preferences as any).parking, true);
});

test("buildMessages includes history", () => {
  const msgs = buildMessages(
    [{ role: "user", content: "hi" }],
    "need apartment",
    null
  );
  assert.equal(msgs.length >= 3, true);
});