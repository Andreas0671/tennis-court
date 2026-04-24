import type { Player, PlayerStats, Round } from "@/types";
import { parseResultInput } from "@/lib/resultParser";

function createEmptyStats(player: Player): PlayerStats {
  return {
    ...player,
    playedRounds: 0,
    pauseRounds: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    points: 0,
  };
}

function getMatchPoints(parsed: ReturnType<typeof parseResultInput>, team: "A" | "B"): number {
  if (!parsed) return 0;
  if (parsed.gamesA === parsed.gamesB) return 2;
  if (parsed.winner === team) return 3;
  if (parsed.winner === "draw") return 1;
  return 0;
}

export function computeLeaderboard(players: Player[], rounds: Round[]): PlayerStats[] {
  const statsMap = Object.fromEntries(players.map((p) => [p.id, createEmptyStats(p)]));

  for (const round of rounds) {
    const hasRoundResult = round.matches.some((match) => parseResultInput(match.result));

    if (hasRoundResult) {
      for (const p of round.benched) {
        if (statsMap[p.id]) statsMap[p.id].pauseRounds += 1;
      }
    }

    for (const match of round.matches) {
      const parsed = parseResultInput(match.result);
      if (!parsed) continue;

      for (const p of [...match.teamA, ...match.teamB]) {
        if (statsMap[p.id]) statsMap[p.id].playedRounds += 1;
      }

      for (const p of match.teamA) {
        const e = statsMap[p.id];
        if (!e) continue;
        e.setsWon += parsed.setsA;
        e.setsLost += parsed.setsB;
        e.gamesWon += parsed.gamesA;
        e.gamesLost += parsed.gamesB;
        if (parsed.winner === "A") e.wins += 1;
        else if (parsed.winner === "B") e.losses += 1;
        else e.draws += 1;
        e.points += getMatchPoints(parsed, "A");
      }

      for (const p of match.teamB) {
        const e = statsMap[p.id];
        if (!e) continue;
        e.setsWon += parsed.setsB;
        e.setsLost += parsed.setsA;
        e.gamesWon += parsed.gamesB;
        e.gamesLost += parsed.gamesA;
        if (parsed.winner === "B") e.wins += 1;
        else if (parsed.winner === "A") e.losses += 1;
        else e.draws += 1;
        e.points += getMatchPoints(parsed, "B");
      }
    }
  }

  return Object.values(statsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const setDiff = (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost);
    if (setDiff !== 0) return setDiff;
    const gameDiff = (b.gamesWon - b.gamesLost) - (a.gamesWon - a.gamesLost);
    if (gameDiff !== 0) return gameDiff;
    return a.name.localeCompare(b.name);
  });
}
