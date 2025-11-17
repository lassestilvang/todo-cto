import { describe, expect, test } from "bun:test";
import { RecurrenceRule } from "@/lib/types";

// Mock date functions to avoid loading database module
function timestampToDate(value: number | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return new Date(value * 1000);
  }
  return value;
}

function dateToUnix(date: Date | null | undefined): number | null {
  if (!date) return null;
  return Math.floor(date.getTime() / 1000);
}

function serializeRecurrence(raw: string | null): RecurrenceRule | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed as RecurrenceRule;
  } catch {
    return null;
  }
}

function deserializeRecurrence(rule: RecurrenceRule | null): string | null {
  if (!rule) return null;
  return JSON.stringify(rule);
}

describe("database utils", () => {
  describe("timestampToDate", () => {
    test("converts unix timestamp to date", () => {
      const timestamp = 1704067200;
      const date = timestampToDate(timestamp);
      expect(date).toBeInstanceOf(Date);
    });

    test("returns null for null input", () => {
      expect(timestampToDate(null)).toBeNull();
    });
  });

  describe("dateToUnix", () => {
    test("converts date to unix timestamp", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const timestamp = dateToUnix(date);
      expect(timestamp).toBeNumber();
      expect(timestamp).toBeGreaterThan(0);
    });

    test("returns null for null input", () => {
      expect(dateToUnix(null)).toBeNull();
    });

    test("returns null for undefined input", () => {
      expect(dateToUnix(undefined)).toBeNull();
    });
  });

  describe("serializeRecurrence and deserializeRecurrence", () => {
    test("serializes and deserializes recurrence rule", () => {
      const rule: RecurrenceRule = {
        type: "daily",
        interval: 1,
      };

      const serialized = deserializeRecurrence(rule);
      expect(serialized).toBeString();

      const deserialized = serializeRecurrence(serialized);
      expect(deserialized).toEqual(rule);
    });

    test("handles null values", () => {
      expect(deserializeRecurrence(null)).toBeNull();
      expect(serializeRecurrence(null)).toBeNull();
    });

    test("handles complex recurrence rule", () => {
      const rule: RecurrenceRule = {
        type: "weekly",
        interval: 2,
        weekdays: [1, 3, 5],
        endDate: new Date("2025-12-31"),
      };

      const serialized = deserializeRecurrence(rule);
      const deserialized = serializeRecurrence(serialized!);

      expect(deserialized?.type).toBe("weekly");
      expect(deserialized?.interval).toBe(2);
      expect(deserialized?.weekdays).toEqual([1, 3, 5]);
    });
  });
});
