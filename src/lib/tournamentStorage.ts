import { buildDefaultCourtNames } from "@/lib/utils";
import type { Gender, Player, Round } from "@/types";

export const TOURNAMENT_STORAGE_KEY = "tennis-court:tournament";

export interface TournamentFormState {
  players: Player[];
  rounds: Round[];
  playerInput: string;
  newPlayer: string;
  newGender: Gender;
  newStrength: number;
  roundCount: number;
  courtCount: number;
  courtNames: string[];
  startTime: string;
  matchDuration: number;
  breakDuration: number;
}

const DEFAULT_COURTS = 2;

export function createDefaultTournamentState(): TournamentFormState {
  return {
    players: [],
    rounds: [],
    playerInput: "",
    newPlayer: "",
    newGender: "m",
    newStrength: 3,
    roundCount: 5,
    courtCount: DEFAULT_COURTS,
    courtNames: buildDefaultCourtNames(DEFAULT_COURTS),
    startTime: "18:00",
    matchDuration: 35,
    breakDuration: 10,
  };
}

export function loadTournamentState(): TournamentFormState {
  const fallback = createDefaultTournamentState();

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(TOURNAMENT_STORAGE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<TournamentFormState>;
    return {
      players: Array.isArray(parsed.players) ? parsed.players : fallback.players,
      rounds: Array.isArray(parsed.rounds) ? parsed.rounds : fallback.rounds,
      playerInput: typeof parsed.playerInput === "string" ? parsed.playerInput : fallback.playerInput,
      newPlayer: typeof parsed.newPlayer === "string" ? parsed.newPlayer : fallback.newPlayer,
      newGender: parsed.newGender === "m" || parsed.newGender === "w" || parsed.newGender === "o" ? parsed.newGender : fallback.newGender,
      newStrength: typeof parsed.newStrength === "number" ? parsed.newStrength : fallback.newStrength,
      roundCount: typeof parsed.roundCount === "number" ? parsed.roundCount : fallback.roundCount,
      courtCount: typeof parsed.courtCount === "number" ? parsed.courtCount : fallback.courtCount,
      courtNames: Array.isArray(parsed.courtNames) ? parsed.courtNames : fallback.courtNames,
      startTime: typeof parsed.startTime === "string" ? parsed.startTime : fallback.startTime,
      matchDuration: typeof parsed.matchDuration === "number" ? parsed.matchDuration : fallback.matchDuration,
      breakDuration: typeof parsed.breakDuration === "number" ? parsed.breakDuration : fallback.breakDuration,
    };
  } catch {
    return fallback;
  }
}

export function saveTournamentState(state: TournamentFormState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(state));
}
