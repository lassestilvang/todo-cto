import { describe, expect, test } from "bun:test";
import { nanoid, cn } from "@/lib/utils";

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
});
