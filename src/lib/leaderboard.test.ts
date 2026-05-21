import { describe, expect, it } from "vitest";
import { computeLeaderboard } from "./leaderboard";
import type { Player, Round } from "@/types";

const makePlayer = (id: string, name: string): Player => ({ id, name, gender: "m", strength: 3 });

const makeRound = (matchResult: string): Round => ({
  id: "r1",
  roundNumber: 1,
  startTime: "18:00",
  endTime: "18:35",
  breakUntil: null,
  benched: [],
  matches: [{
    id: "m1",
    courtName: "Court 1",
    teamA: [makePlayer("a", "Alice"), makePlayer("b", "Bob")],
    teamB: [makePlayer("c", "Clara"), makePlayer("d", "David")],
    result: matchResult,
    notes: "",
  }],
});

describe("computeLeaderboard", () => {
  it("returns empty array for no players", () => {
    expect(computeLeaderboard([], [])).toEqual([]);
  });

  it("grants 3 points to the winner team", () => {
    const players = [makePlayer("a", "Alice"), makePlayer("b", "Bob"), makePlayer("c", "Clara"), makePlayer("d", "David")];
    const board = computeLeaderboard(players, [makeRound("6:4")]);
    const alice = board.find((e) => e.id === "a");
    const clara = board.find((e) => e.id === "c");
    expect(alice?.points).toBe(3);
    expect(clara?.points).toBe(0);
  });

  it("counts played rounds only when a result is entered", () => {
    const players = [makePlayer("a", "Alice"), makePlayer("b", "Bob"), makePlayer("c", "Clara"), makePlayer("d", "David")];
    const board = computeLeaderboard(players, [makeRound("")]);

    expect(board.every((entry) => entry.playedRounds === 0)).toBe(true);
  });

  it("sorts by points descending", () => {
    const players = [makePlayer("a", "Alice"), makePlayer("b", "Bob"), makePlayer("c", "Clara"), makePlayer("d", "David")];
    const board = computeLeaderboard(players, [makeRound("6:4")]);
    expect(board[0].points).toBeGreaterThanOrEqual(board[1].points);
  });

  it("counts benched players pause rounds", () => {
    const players = [makePlayer("a", "Alice"), makePlayer("b", "Bob"), makePlayer("c", "Clara"), makePlayer("d", "David"), makePlayer("e", "Eva")];
    const round: Round = { ...makeRound("6:4"), benched: [makePlayer("e", "Eva")] };
    const board = computeLeaderboard(players, [round]);
    const eva = board.find((e) => e.id === "e");
    expect(eva?.pauseRounds).toBe(1);
  });

  it("counts pause rounds even when no match result is entered", () => {
    const players = [makePlayer("a", "Alice"), makePlayer("b", "Bob"), makePlayer("c", "Clara"), makePlayer("d", "David"), makePlayer("e", "Eva")];
    const round: Round = { ...makeRound(""), benched: [makePlayer("e", "Eva")] };
    const board = computeLeaderboard(players, [round]);
    const eva = board.find((e) => e.id === "e");

    expect(eva?.pauseRounds).toBe(1);
    expect(eva?.playedRounds).toBe(0);
  });
});
