import { describe, expect, test } from "bun:test";
import { nanoid, cn, minutesToDuration, durationToMinutes, isValidTimeString, toDateTimeLocalValue, parseDateTimeLocal } from "@/lib/utils";

describe("utils", () => {
  describe("nanoid", () => {
    test("generates unique ids", () => {
      const id1 = nanoid();
      const id2 = nanoid();
      expect(id1).not.toBe(id2);
    });

    test("generates ids of correct length", () => {
      const id = nanoid(10);
      expect(id).toHaveLength(10);
    });

    test("generates ids with default length", () => {
      const id = nanoid();
      expect(id).toHaveLength(21);
    });
  });

  describe("cn", () => {
    test("merges class names", () => {
      const result = cn("p-4", "text-red-500");
      expect(result).toContain("p-4");
      expect(result).toContain("text-red-500");
    });

    test("handles conditional classes", () => {
      const result = cn("p-4", false && "hidden", "text-blue-500");
      expect(result).toContain("p-4");
      expect(result).toContain("text-blue-500");
      expect(result).not.toContain("hidden");
    });

    test("merges conflicting Tailwind classes", () => {
      const result = cn("p-4", "p-6");
      expect(result).not.toContain("p-4");
      expect(result).toContain("p-6");
    });
  });

  describe("minutesToDuration", () => {
    test("converts minutes to duration format", () => {
      expect(minutesToDuration(90)).toBe("01:30");
      expect(minutesToDuration(150)).toBe("02:30");
      expect(minutesToDuration(0)).toBe("00:00");
    });

    test("handles undefined and null values", () => {
      expect(minutesToDuration(undefined)).toBe("");
      expect(minutesToDuration(null)).toBe("");
    });

    test("handles NaN values", () => {
      expect(minutesToDuration(NaN)).toBe("");
    });
  });

  describe("durationToMinutes", () => {
    test("converts duration string to minutes", () => {
      expect(durationToMinutes("01:30")).toBe(90);
      expect(durationToMinutes("02:30")).toBe(150);
      expect(durationToMinutes("00:00")).toBe(0);
    });

    test("returns null for invalid time strings", () => {
      expect(durationToMinutes("invalid")).toBeNull();
      expect(durationToMinutes("25:00")).toBeNull();
      expect(durationToMinutes("12:60")).toBeNull();
      expect(durationToMinutes("")).toBeNull();
      expect(durationToMinutes(null)).toBeNull();
    });
  });

  describe("isValidTimeString", () => {
    test("validates correct time strings", () => {
      expect(isValidTimeString("09:30")).toBe(true);
      expect(isValidTimeString("23:59")).toBe(true);
      expect(isValidTimeString("00:00")).toBe(true);
    });

    test("rejects invalid time strings", () => {
      expect(isValidTimeString("24:00")).toBe(false);
      expect(isValidTimeString("12:60")).toBe(false);
      expect(isValidTimeString("invalid")).toBe(false);
      expect(isValidTimeString("")).toBe(false);
    });
  });

  describe("toDateTimeLocalValue", () => {
    test("formats date to datetime-local format", () => {
      const date = new Date("2024-01-01T12:30:00");
      expect(toDateTimeLocalValue(date)).toBe("2024-01-01T12:30");
    });
  });

  describe("parseDateTimeLocal", () => {
    test("parses datetime-local value to Date", () => {
      const result = parseDateTimeLocal("2024-01-01T12:30");
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(new Date("2024-01-01T12:30").getTime());
    });
  });
});
