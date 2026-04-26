export type Gender = "m" | "w" | "o";

export interface Player {
  id: string;
  name: string;
  gender: Gender;
  strength: number;
}

export interface Match {
  id: string;
  courtName: string;
  teamA: Player[];
  teamB: Player[];
  result: string;
  notes: string;
}

export interface Round {
  id: string;
  roundNumber: number;
  startTime: string;
  endTime: string;
  breakUntil: string | null;
  matches: Match[];
  benched: Player[];
}

export interface PlayerStats extends Player {
  playedRounds: number;
  pauseRounds: number;
  wins: number;
  losses: number;
  draws: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  points: number;
}

export interface TournamentHistory {
  played: Record<string, number>;
  pause: Record<string, number>;
  teamPairs: Record<string, number>;
  sameGenderOpponentPairs: Record<string, number>;
}

export interface ParsedResult {
  setsA: number;
  setsB: number;
  gamesA: number;
  gamesB: number;
  winner: "A" | "B" | "draw";
}

export interface TournamentFormState {
  tournamentName: string;
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

export interface SavedTournament {
  slug: string;
  title: string;
  updatedAt: string | null;
  state: TournamentFormState;
}
