import { describe, expect, it } from "vitest";
import { addMinutesToTime, buildDefaultCourtNames, shuffleArray } from "./utils";

describe("addMinutesToTime", () => {
  it("adds minutes to a time string", () => {
    expect(addMinutesToTime("18:00", 30)).toBe("18:30");
  });

  it("wraps correctly past midnight", () => {
    expect(addMinutesToTime("23:50", 20)).toBe("00:10");
  });

  it("handles exactly midnight", () => {
    expect(addMinutesToTime("00:00", 0)).toBe("00:00");
  });

  it("adds hours correctly", () => {
    expect(addMinutesToTime("10:00", 90)).toBe("11:30");
  });
});

describe("buildDefaultCourtNames", () => {
  it("builds the correct number of courts", () => {
    expect(buildDefaultCourtNames(3)).toHaveLength(3);
  });

  it("names courts starting from 1", () => {
    expect(buildDefaultCourtNames(3)).toEqual(["Court 1", "Court 2", "Court 3"]);
  });

  it("returns empty array for 0", () => {
    expect(buildDefaultCourtNames(0)).toEqual([]);
  });
});

describe("shuffleArray", () => {
  it("preserves array length", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr)).toHaveLength(arr.length);
  });

  it("does not mutate the original array", () => {
    const arr = [1, 2, 3];
    shuffleArray(arr);
    expect(arr).toEqual([1, 2, 3]);
  });

  it("contains all original elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual([...arr].sort());
  });
});
