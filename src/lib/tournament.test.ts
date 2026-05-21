import { describe, expect, it } from "vitest";
import { createSchedule, replaceDroppedPlayerFromRound } from "./tournament";
import type { Gender, Player } from "@/types";

function makePlayer(id: string, gender: Gender, strength: number): Player {
  return {
    id,
    name: `${gender}-${id}`,
    gender,
    strength,
  };
}

function getTeams(players: Player[]) {
  const [round] = createSchedule(players, 1, ["Court 1", "Court 2"], "18:00", 35, 10);
  return round?.matches.flatMap((match) => [match.teamA, match.teamB]) ?? [];
}

function isMixedTeam(team: Player[]) {
  const genders = new Set(team.map((player) => player.gender));
  return genders.has("m") && genders.has("w");
}

function sameGenderOpponentKeys(rounds: ReturnType<typeof createSchedule>, gender: Gender) {
  return rounds.flatMap((round) =>
    round.matches.flatMap((match) =>
      match.teamA.flatMap((playerA) =>
        match.teamB
          .filter((playerB) => playerA.gender === gender && playerB.gender === gender)
          .map((playerB) => [playerA.id, playerB.id].sort().join("-")),
      ),
    ),
  );
}

describe("createSchedule", () => {
  it("builds mixed teams when enough women and men are available", () => {
    const teams = getTeams([
      makePlayer("1", "m", 5),
      makePlayer("2", "m", 4),
      makePlayer("3", "w", 3),
      makePlayer("4", "w", 2),
    ]);

    expect(teams).toHaveLength(2);
    expect(teams.every(isMixedTeam)).toBe(true);
  });

  it("maximizes mixed teams across multiple courts", () => {
    const teams = getTeams([
      makePlayer("1", "m", 8),
      makePlayer("2", "m", 7),
      makePlayer("3", "m", 6),
      makePlayer("4", "m", 5),
      makePlayer("5", "w", 8),
      makePlayer("6", "w", 7),
      makePlayer("7", "w", 6),
      makePlayer("8", "w", 5),
    ]);

    expect(teams).toHaveLength(4);
    expect(teams.every(isMixedTeam)).toBe(true);
  });

  it("benches players instead of creating same-gender teams", () => {
    const [round] = createSchedule(
      [
        makePlayer("1", "m", 6),
        makePlayer("2", "m", 5),
        makePlayer("3", "m", 4),
        makePlayer("4", "w", 3),
      ],
      1,
      ["Court 1"],
      "18:00",
      35,
      10,
    );

    expect(round.matches).toHaveLength(0);
    expect(round.benched).toHaveLength(4);
  });

  it("uses only possible mixed teams and benches overrepresented players", () => {
    const [round] = createSchedule(
      [
        makePlayer("1", "m", 8),
        makePlayer("2", "m", 7),
        makePlayer("3", "m", 6),
        makePlayer("4", "m", 5),
        makePlayer("5", "m", 4),
        makePlayer("6", "m", 3),
        makePlayer("7", "w", 8),
        makePlayer("8", "w", 7),
      ],
      1,
      ["Court 1"],
      "18:00",
      35,
      10,
    );

    const teams = round.matches.flatMap((match) => [match.teamA, match.teamB]);

    expect(teams).toHaveLength(2);
    expect(teams.every(isMixedTeam)).toBe(true);
    expect(round.benched).toHaveLength(4);
  });

  it("pairs similarly strong teams against each other", () => {
    const [round] = createSchedule(
      [
        makePlayer("1", "m", 5),
        makePlayer("2", "m", 1),
        makePlayer("3", "w", 5),
        makePlayer("4", "w", 1),
      ],
      1,
      ["Court 1"],
      "18:00",
      35,
      10,
    );

    const [match] = round.matches;
    const teamAStrength = match.teamA.reduce((sum, player) => sum + player.strength, 0);
    const teamBStrength = match.teamB.reduce((sum, player) => sum + player.strength, 0);

    expect(Math.abs(teamAStrength - teamBStrength)).toBeLessThanOrEqual(1);
  });

  it("rotates pauses before benching the same player again when possible", () => {
    const rounds = createSchedule(
      [
        makePlayer("1", "m", 5),
        makePlayer("2", "m", 4),
        makePlayer("3", "m", 3),
        makePlayer("4", "w", 5),
        makePlayer("5", "w", 4),
        makePlayer("6", "w", 3),
      ],
      3,
      ["Court 1"],
      "18:00",
      35,
      10,
    );

    const pauses = rounds.flatMap((round) => round.benched.map((player) => player.id));

    expect(new Set(pauses).size).toBe(pauses.length);
  });

  it("avoids repeating the same team pair when another mixed pairing is available", () => {
    const rounds = createSchedule(
      [
        makePlayer("1", "m", 5),
        makePlayer("2", "m", 4),
        makePlayer("3", "w", 5),
        makePlayer("4", "w", 4),
      ],
      2,
      ["Court 1"],
      "18:00",
      35,
      10,
    );

    const teamKeys = rounds.flatMap((round) =>
      round.matches.flatMap((match) =>
        [match.teamA, match.teamB].map((team) => team.map((player) => player.id).sort().join("-")),
      ),
    );

    expect(new Set(teamKeys).size).toBe(teamKeys.length);
  });

  it("avoids repeated male and female opponents when other matchups are available", () => {
    const rounds = createSchedule(
      [
        makePlayer("m1", "m", 8),
        makePlayer("m2", "m", 7),
        makePlayer("m3", "m", 6),
        makePlayer("m4", "m", 5),
        makePlayer("w1", "w", 8),
        makePlayer("w2", "w", 7),
        makePlayer("w3", "w", 6),
        makePlayer("w4", "w", 5),
      ],
      3,
      ["Court 1", "Court 2"],
      "18:00",
      35,
      10,
    );

    const maleOpponentKeys = sameGenderOpponentKeys(rounds, "m");
    const femaleOpponentKeys = sameGenderOpponentKeys(rounds, "w");

    expect(new Set(maleOpponentKeys).size).toBe(maleOpponentKeys.length);
    expect(new Set(femaleOpponentKeys).size).toBe(femaleOpponentKeys.length);
  });

  it("replaces a dropped player with the closest matching benched player in future rounds", () => {
    const dropped = makePlayer("m1", "m", 5);
    const weakerReplacement = makePlayer("m3", "m", 2);
    const bestReplacement = makePlayer("m4", "m", 4);
    const rounds = [
      {
        id: "round-1",
        roundNumber: 1,
        startTime: "18:00",
        endTime: "18:35",
        breakUntil: "18:45",
        matches: [{
          id: "match-1",
          courtName: "Court 1",
          teamA: [dropped, makePlayer("w1", "w", 5)],
          teamB: [makePlayer("m2", "m", 5), makePlayer("w2", "w", 4)],
          result: "",
          notes: "",
        }],
        benched: [weakerReplacement, bestReplacement, makePlayer("w3", "w", 3)],
      },
      {
        id: "round-2",
        roundNumber: 2,
        startTime: "18:45",
        endTime: "19:20",
        breakUntil: null,
        matches: [{
          id: "match-2",
          courtName: "Court 1",
          teamA: [makePlayer("m2", "m", 5), makePlayer("w1", "w", 5)],
          teamB: [dropped, makePlayer("w2", "w", 4)],
          result: "",
          notes: "",
        }],
        benched: [bestReplacement],
      },
    ];

    const result = replaceDroppedPlayerFromRound(rounds, dropped.id, "round-1");

    expect(result.summary).toMatchObject({ droppedPlayer: dropped, replacedRounds: 2, removedBenchRounds: 0, unresolvedRounds: [] });
    expect(result.rounds[0].matches[0].teamA[0]).toBe(bestReplacement);
    expect(result.rounds[1].matches[0].teamB[0]).toBe(bestReplacement);
    expect(result.rounds[0].benched).not.toContain(bestReplacement);
    expect(result.rounds[0].absent).toEqual([dropped]);
    expect(result.rounds[1].absent).toEqual([dropped]);
  });
});
