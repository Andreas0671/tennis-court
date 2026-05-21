import { describe, expect, it } from "vitest";
import { formatUpdatedAt } from "./dateTime";

describe("formatUpdatedAt", () => {
  it("formats UTC timestamps as German summer time", () => {
    expect(formatUpdatedAt("2026-04-26T06:30:00+00:00")).toBe("26.04.26, 08:30");
  });

  it("formats UTC timestamps as German winter time", () => {
    expect(formatUpdatedAt("2026-01-26T06:30:00+00:00")).toBe("26.01.26, 07:30");
  });

  it("treats legacy SQL timestamps without offset as UTC", () => {
    expect(formatUpdatedAt("2026-04-26 06:30:00")).toBe("26.04.26, 08:30");
  });
});
