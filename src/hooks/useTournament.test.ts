import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TOURNAMENT_STORAGE_KEY } from "@/lib/tournamentStorage";
import { useTournament } from "./useTournament";

describe("useTournament persistence", () => {
  beforeEach(() => {
    const store = new Map<string, string>();

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => store.clear(),
        getItem: (key: string) => store.get(key) ?? null,
        key: (index: number) => Array.from(store.keys())[index] ?? null,
        removeItem: (key: string) => store.delete(key),
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        get length() {
          return store.size;
        },
      },
    });

    window.localStorage.clear();
  });

  it("loads persisted tournament data from local storage", () => {
    localStorage.setItem(
      TOURNAMENT_STORAGE_KEY,
      JSON.stringify({
        players: [{ id: "p1", name: "Alex", gender: "m", strength: 4 }],
        rounds: [],
        playerInput: "bulk",
        newPlayer: "Chris",
        newGender: "w",
        newStrength: 2,
        roundCount: 7,
        courtCount: 3,
        courtNames: ["Center Court", "Court 2", "Court 3"],
        startTime: "19:30",
        matchDuration: 40,
        breakDuration: 15,
      }),
    );

    const { result } = renderHook(() => useTournament());

    expect(result.current.players).toEqual([{ id: "p1", name: "Alex", gender: "m", strength: 4 }]);
    expect(result.current.playerInput).toBe("bulk");
    expect(result.current.newPlayer).toBe("Chris");
    expect(result.current.newGender).toBe("w");
    expect(result.current.newStrength).toBe(2);
    expect(result.current.roundCount).toBe(7);
    expect(result.current.courtCount).toBe(3);
    expect(result.current.courtNames).toEqual(["Center Court", "Court 2", "Court 3"]);
    expect(result.current.startTime).toBe("19:30");
    expect(result.current.matchDuration).toBe(40);
    expect(result.current.breakDuration).toBe(15);
  });

  it("persists tournament changes to local storage", () => {
    const { result } = renderHook(() => useTournament());

    act(() => {
      result.current.setNewPlayer("Mia");
    });

    act(() => {
      result.current.addSinglePlayer();
    });

    act(() => {
      result.current.setPlayerInput("Ava\nNoah");
    });

    const persisted = JSON.parse(localStorage.getItem(TOURNAMENT_STORAGE_KEY) ?? "null");

    expect(persisted.players).toHaveLength(1);
    expect(persisted.players[0]).toMatchObject({ name: "Mia", gender: "m", strength: 3 });
    expect(persisted.playerInput).toBe("Ava\nNoah");
    expect(persisted.roundCount).toBe(5);
  });

  it("writes the cleared default state back to local storage", () => {
    localStorage.setItem(
      TOURNAMENT_STORAGE_KEY,
      JSON.stringify({
        players: [{ id: "p1", name: "Alex", gender: "m", strength: 4 }],
        rounds: [],
        playerInput: "bulk",
        newPlayer: "Chris",
        newGender: "w",
        newStrength: 2,
        roundCount: 7,
        courtCount: 3,
        courtNames: ["Center Court", "Court 2", "Court 3"],
        startTime: "19:30",
        matchDuration: 40,
        breakDuration: 15,
      }),
    );

    const { result } = renderHook(() => useTournament());

    act(() => {
      result.current.clearAll();
    });

    const persisted = JSON.parse(localStorage.getItem(TOURNAMENT_STORAGE_KEY) ?? "null");

    expect(result.current.players).toEqual([]);
    expect(result.current.rounds).toEqual([]);
    expect(result.current.playerInput).toBe("");
    expect(result.current.newPlayer).toBe("");
    expect(result.current.newGender).toBe("m");
    expect(result.current.newStrength).toBe(3);
    expect(result.current.roundCount).toBe(5);
    expect(result.current.courtCount).toBe(2);
    expect(result.current.courtNames).toEqual(["Court 1", "Court 2"]);
    expect(result.current.startTime).toBe("18:00");
    expect(result.current.matchDuration).toBe(35);
    expect(result.current.breakDuration).toBe(10);
    expect(persisted.players).toEqual([]);
    expect(persisted.rounds).toEqual([]);
  });
});
