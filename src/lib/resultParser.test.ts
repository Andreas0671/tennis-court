import { describe, expect, it } from "vitest";
import { parseResultInput } from "./resultParser";

describe("parseResultInput", () => {
  it("returns null for empty string", () => {
    expect(parseResultInput("")).toBeNull();
  });

  it("returns null for non-score text", () => {
    expect(parseResultInput("no score here")).toBeNull();
  });

  it("parses a single set win for team A", () => {
    const result = parseResultInput("6:4");
    expect(result?.winner).toBe("A");
    expect(result?.setsA).toBe(1);
    expect(result?.setsB).toBe(0);
    expect(result?.gamesA).toBe(6);
    expect(result?.gamesB).toBe(4);
  });

  it("parses a best-of-three match with tiebreak", () => {
    const result = parseResultInput("6:4 4:6 10:8");
    expect(result?.setsA).toBe(2);
    expect(result?.setsB).toBe(1);
    expect(result?.gamesA).toBe(20);
    expect(result?.gamesB).toBe(18);
    expect(result?.winner).toBe("A");
  });

  it("detects a draw when sets are equal", () => {
    const result = parseResultInput("6:4 4:6");
    expect(result?.winner).toBe("draw");
    expect(result?.setsA).toBe(1);
    expect(result?.setsB).toBe(1);
  });

  it("team B wins", () => {
    const result = parseResultInput("4:6 4:6");
    expect(result?.winner).toBe("B");
    expect(result?.setsA).toBe(0);
    expect(result?.setsB).toBe(2);
  });

  it("accepts dash as separator", () => {
    const result = parseResultInput("6-4");
    expect(result?.winner).toBe("A");
  });
});
