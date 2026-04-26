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

function sameGenderOpponentPairScore(playerA: Player, playerB: Player, history: TournamentHistory): number {
  const repeatPenalty = history.sameGenderOpponentPairs[teamPairKey(playerA, playerB)] ?? 0;
  const strengthDelta = Math.abs(Number(playerA.strength ?? 0) - Number(playerB.strength ?? 0));

  return repeatPenalty * 1000 + strengthDelta;
}

function createSameGenderOpponentPairs(players: Player[], history: TournamentHistory): Player[][] {
  const availablePlayers = [...players].sort(byStrengthDesc);
  const pairs: Player[][] = [];

  while (availablePlayers.length >= 2) {
    const player = availablePlayers.shift();
    if (!player) break;

    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < availablePlayers.length; i += 1) {
      const score = sameGenderOpponentPairScore(player, availablePlayers[i], history);

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const opponent = availablePlayers.splice(bestIndex, 1)[0];
    if (opponent) pairs.push([player, opponent]);
  }

  return pairs;
}

function mixedAssignmentScore(teamA: Player[], teamB: Player[], history: TournamentHistory): number {
  const teamRepeatPenalty =
    (history.teamPairs[teamPairKey(teamA[0], teamA[1])] ?? 0) +
    (history.teamPairs[teamPairKey(teamB[0], teamB[1])] ?? 0);
  const strengthDelta = Math.abs(teamStrength(teamA) - teamStrength(teamB));

  return teamRepeatPenalty * 100 + strengthDelta;
}

function createMixedMatchTeams(men: Player[], women: Player[], history: TournamentHistory): Player[][] {
  const [manA, manB] = men;
  const [womanA, womanB] = women;
  const straightTeams = [[manA, womanA], [manB, womanB]];
  const crossedTeams = [[manA, womanB], [manB, womanA]];

  return mixedAssignmentScore(straightTeams[0], straightTeams[1], history) <=
    mixedAssignmentScore(crossedTeams[0], crossedTeams[1], history)
    ? straightTeams
    : crossedTeams;
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
  const maleOpponentPairs = createSameGenderOpponentPairs(activeMen, history);
  const femaleOpponentPairs = createSameGenderOpponentPairs(activeWomen, history);
  const matches: Match[] = [];

  for (let i = 0; i < matchCount; i += 1) {
    const malePair = maleOpponentPairs[i];
    const femalePair = femaleOpponentPairs[i];
    if (!malePair || !femalePair) continue;

    const [teamA, teamB] = createMixedMatchTeams(malePair, femalePair, history);

    for (const p of [...teamA, ...teamB]) {
      history.played[p.id] = (history.played[p.id] ?? 0) + 1;
    }

    const teamAKey = teamPairKey(teamA[0], teamA[1]);
    const teamBKey = teamPairKey(teamB[0], teamB[1]);
    history.teamPairs[teamAKey] = (history.teamPairs[teamAKey] ?? 0) + 1;
    history.teamPairs[teamBKey] = (history.teamPairs[teamBKey] ?? 0) + 1;
    for (const playerA of teamA) {
      if (playerA.gender !== "m" && playerA.gender !== "w") continue;

      for (const playerB of teamB) {
        if (playerA.gender !== playerB.gender) continue;

        const opponentPairKey = teamPairKey(playerA, playerB);
        history.sameGenderOpponentPairs[opponentPairKey] = (history.sameGenderOpponentPairs[opponentPairKey] ?? 0) + 1;
      }
    }

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
  const history: TournamentHistory = { played: {}, pause: {}, teamPairs: {}, sameGenderOpponentPairs: {} };
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
