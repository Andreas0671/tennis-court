import type { Match, Player, Round, TournamentHistory } from "@/types";
import { addMinutesToTime } from "@/lib/utils";

function byStrengthDesc(a: Player, b: Player): number {
  return Number(b.strength ?? 0) - Number(a.strength ?? 0);
}

function teamStrength(team: Player[]): number {
  return team.reduce((total, player) => total + Number(player.strength ?? 0), 0);
}

function byPlayPriority(history: TournamentHistory) {
  return (a: Player, b: Player): number => {
    const pauseDelta = (history.pause[b.id] ?? 0) - (history.pause[a.id] ?? 0);
    if (pauseDelta !== 0) return pauseDelta;
    const playedDelta = (history.played[a.id] ?? 0) - (history.played[b.id] ?? 0);
    if (playedDelta !== 0) return playedDelta;
    return byStrengthDesc(a, b);
  };
}

function teamPairKey(playerA: Player, playerB: Player): string {
  return [playerA.id, playerB.id].sort().join("::");
}

function createMixedTeams(men: Player[], women: Player[], history: TournamentHistory): Player[][] {
  const orderedMen = [...men].sort(byStrengthDesc);
  const availableWomen = [...women].sort(byStrengthDesc);
  const teams: Player[][] = [];
  const targetStrength = teamStrength([...men, ...women]) / Math.max(1, men.length);

  for (const man of orderedMen) {
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < availableWomen.length; i += 1) {
      const woman = availableWomen[i];
      const repeatPenalty = history.teamPairs[teamPairKey(man, woman)] ?? 0;
      const strengthDelta = Math.abs(
        Number(man.strength ?? 0) + Number(woman.strength ?? 0) - targetStrength,
      );
      const score = repeatPenalty * 100 + strengthDelta;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const woman = availableWomen.splice(bestIndex, 1)[0];
    if (!woman) break;
    teams.push([man, woman]);
  }

  return teams;
}

function createRound(
  players: Player[],
  roundNumber: number,
  courtNames: string[],
  history: TournamentHistory,
): { matches: Match[]; benched: Player[] } {
  const men = players.filter((player) => player.gender === "m").sort(byPlayPriority(history));
  const women = players.filter((player) => player.gender === "w").sort(byPlayPriority(history));
  const matchCount = Math.min(Math.floor(men.length / 2), Math.floor(women.length / 2), courtNames.length);
  const activeMen = men.slice(0, matchCount * 2);
  const activeWomen = women.slice(0, matchCount * 2);
  const activeIds = new Set([...activeMen, ...activeWomen].map((player) => player.id));
  const benched = players.filter((player) => !activeIds.has(player.id));
  const teams = createMixedTeams(activeMen, activeWomen, history).sort(
    (teamA, teamB) => teamStrength(teamB) - teamStrength(teamA),
  );
  const matches: Match[] = [];

  for (let i = 0; i < matchCount; i += 1) {
    const teamA = teams[i * 2];
    const teamB = teams[i * 2 + 1];

    if (!teamA || !teamB) continue;

    for (const p of [...teamA, ...teamB]) {
      history.played[p.id] = (history.played[p.id] ?? 0) + 1;
    }

    const teamAKey = teamPairKey(teamA[0], teamA[1]);
    const teamBKey = teamPairKey(teamB[0], teamB[1]);
    history.teamPairs[teamAKey] = (history.teamPairs[teamAKey] ?? 0) + 1;
    history.teamPairs[teamBKey] = (history.teamPairs[teamBKey] ?? 0) + 1;

    matches.push({
      id: `r${roundNumber}-m${i + 1}-${[...teamA, ...teamB].map((p) => p.id).join("-")}`,
      courtName: courtNames[i] ?? `Court ${i + 1}`,
      teamA,
      teamB,
      result: "",
      notes: "",
    });
  }

  for (const p of benched) {
    history.pause[p.id] = (history.pause[p.id] ?? 0) + 1;
  }

  return { matches, benched };
}

export function createSchedule(
  players: Player[],
  roundCount: number,
  courtNames: string[],
  startTime: string,
  matchDuration: number,
  breakDuration: number,
): Round[] {
  const history: TournamentHistory = { played: {}, pause: {}, teamPairs: {} };
  const rounds: Round[] = [];
  const safeCount = Number(roundCount) || 0;
  const blockMinutes = Number(matchDuration) + Number(breakDuration);

  for (let i = 0; i < safeCount; i += 1) {
    const roundNumber = i + 1;
    const round = createRound(players, roundNumber, courtNames, history);
    const roundStart = addMinutesToTime(startTime, i * blockMinutes);
    const roundEnd = addMinutesToTime(roundStart, Number(matchDuration));

    rounds.push({
      id: `runde-${roundNumber}`,
      roundNumber,
      startTime: roundStart,
      endTime: roundEnd,
      breakUntil: i < safeCount - 1 ? addMinutesToTime(roundEnd, Number(breakDuration)) : null,
      matches: round.matches,
      benched: round.benched,
    });
  }

  return rounds;
}
