import { describe, expect, it, vi } from "vitest";
import { printSection, PRINT_TARGET_ATTRIBUTE } from "./printSection";

describe("printSection", () => {
  it("marks the requested target while printing and cleans up afterwards", () => {
    document.body.innerHTML = '<section id="round-print"></section>';
    const target = document.getElementById("round-print");
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {
      expect(target?.getAttribute(PRINT_TARGET_ATTRIBUTE)).toBe("true");
    });

    const result = printSection("round-print");

    expect(result).toBe(true);
    expect(printSpy).toHaveBeenCalledOnce();
    expect(target?.hasAttribute(PRINT_TARGET_ATTRIBUTE)).toBe(false);
    printSpy.mockRestore();
  });

  it("does nothing when the target does not exist", () => {
    document.body.innerHTML = "";
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    const result = printSection("missing-target");

    expect(result).toBe(false);
    expect(printSpy).not.toHaveBeenCalled();
    expect(document.body.hasAttribute(PRINT_TARGET_ATTRIBUTE)).toBe(false);
    printSpy.mockRestore();
  });
});
