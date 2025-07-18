import { format } from "date-fns";
import { describe, expect, it } from "vitest";

/**
 * Test utility functions
 */
describe("Date utilities", () => {
  it("should format dates correctly for daily counts", () => {
    const testDate = new Date("2025-01-15");
    const formatted = format(testDate, "yyyy-MM-dd");
    expect(formatted).toBe("2025-01-15");
  });

  it("should handle today's date formatting", () => {
    const today = new Date();
    const formatted = format(today, "yyyy-MM-dd");
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
