import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LuCalendarRange,
  LuClock3,
  LuMedal,
  LuPlus,
  LuRotateCcw,
  LuShuffle,
  LuSparkles,
  LuStar,
  LuSwords,
  LuTrash2,
  LuTrophy,
  LuUsers,
} from "react-icons/lu";

const DEFAULT_COURTS = 2;

function safeRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildDefaultCourtNames(count) {
  return Array.from({ length: count }, (_, index) => `Court ${index + 1}`);
}

function addMinutesToTime(timeString, minutesToAdd) {
  const [hourText = "18", minuteText = "00"] = String(timeString || "18:00").split(":");
  const totalMinutes = Number(hourText) * 60 + Number(minuteText) + Number(minutesToAdd || 0);
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseResultInput(value) {
  const matches = String(value || "").match(/(\d+)\s*[:\-]\s*(\d+)/g);
  if (!matches) return null;

  let setsA = 0;
  let setsB = 0;
  let gamesA = 0;
  let gamesB = 0;

  matches.forEach((setText) => {
    const [a, b] = setText.split(/[:\-]/).map((part) => Number(part.trim()) || 0);
    gamesA += a;
    gamesB += b;
    if (a > b) setsA += 1;
    if (b > a) setsB += 1;
  });

  return {
    setsA,
    setsB,
    gamesA,
    gamesB,
    winner: setsA > setsB ? "A" : setsB > setsA ? "B" : "draw",
  };
}

function sumStrength(players) {
  return players.reduce((sum, player) => sum + Number(player.strength || 0), 0);
}

function genderLabel(gender) {
  if (gender === "w") return "Weiblich";
  if (gender === "m") return "Männlich";
  return "Offen";
}

function createEmptyStats(player) {
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

function createRound(players, roundNumber, courtNames, history) {
  const ordered = [...players].sort((a, b) => {
    const pauseDelta = (history.pause[b.id] || 0) - (history.pause[a.id] || 0);
    if (pauseDelta !== 0) return pauseDelta;

    const playedDelta = (history.played[a.id] || 0) - (history.played[b.id] || 0);
    if (playedDelta !== 0) return playedDelta;

    return Number(b.strength || 0) - Number(a.strength || 0);
  });

  const matchCount = Math.min(Math.floor(ordered.length / 4), courtNames.length);
  const activePlayers = shuffleArray(ordered.slice(0, matchCount * 4));
  const benched = ordered.slice(matchCount * 4);
  const matches = [];

  for (let index = 0; index < matchCount; index += 1) {
    const group = activePlayers.slice(index * 4, index * 4 + 4).sort((a, b) => Number(b.strength || 0) - Number(a.strength || 0));
    const teamA = [group[0], group[3]];
    const teamB = [group[1], group[2]];

    [...teamA, ...teamB].forEach((player) => {
      history.played[player.id] = (history.played[player.id] || 0) + 1;
    });

    matches.push({
      id: `r${roundNumber}-m${index + 1}-${group.map((player) => player.id).join("-")}`,
      courtName: courtNames[index] || `Court ${index + 1}`,
      teamA,
      teamB,
      result: "",
      notes: "",
    });
  }

  benched.forEach((player) => {
    history.pause[player.id] = (history.pause[player.id] || 0) + 1;
  });

  return { matches, benched };
}

function createSchedule(players, roundCount, courtNames, startTime, matchDuration, breakDuration) {
  const history = { played: {}, pause: {} };
  const rounds = [];
  const safeRoundCount = Number(roundCount) || 0;
  const blockMinutes = Number(matchDuration) + Number(breakDuration);

  for (let index = 0; index < safeRoundCount; index += 1) {
    const roundNumber = index + 1;
    const round = createRound(players, roundNumber, courtNames, history);
    const roundStart = addMinutesToTime(startTime, index * blockMinutes);
    const roundEnd = addMinutesToTime(roundStart, Number(matchDuration));

    rounds.push({
      id: `runde-${roundNumber}`,
      roundNumber,
      startTime: roundStart,
      endTime: roundEnd,
      breakUntil: index < safeRoundCount - 1 ? addMinutesToTime(roundEnd, Number(breakDuration)) : null,
      matches: round.matches,
      benched: round.benched,
    });
  }

  return rounds;
}

function computeLeaderboard(players, rounds) {
  const statsMap = Object.fromEntries(players.map((player) => [player.id, createEmptyStats(player)]));

  rounds.forEach((round) => {
    round.benched.forEach((player) => {
      if (statsMap[player.id]) statsMap[player.id].pauseRounds += 1;
    });

    round.matches.forEach((match) => {
      [...match.teamA, ...match.teamB].forEach((player) => {
        if (statsMap[player.id]) statsMap[player.id].playedRounds += 1;
      });

      const parsed = parseResultInput(match.result);
      if (!parsed) return;

      match.teamA.forEach((player) => {
        const entry = statsMap[player.id];
        if (!entry) return;
        entry.setsWon += parsed.setsA;
        entry.setsLost += parsed.setsB;
        entry.gamesWon += parsed.gamesA;
        entry.gamesLost += parsed.gamesB;
        if (parsed.winner === "A") {
          entry.wins += 1;
          entry.points += 3;
        } else if (parsed.winner === "B") {
          entry.losses += 1;
        } else {
          entry.draws += 1;
          entry.points += 1;
        }
      });

      match.teamB.forEach((player) => {
        const entry = statsMap[player.id];
        if (!entry) return;
        entry.setsWon += parsed.setsB;
        entry.setsLost += parsed.setsA;
        entry.gamesWon += parsed.gamesB;
        entry.gamesLost += parsed.gamesA;
        if (parsed.winner === "B") {
          entry.wins += 1;
          entry.points += 3;
        } else if (parsed.winner === "A") {
          entry.losses += 1;
        } else {
          entry.draws += 1;
          entry.points += 1;
        }
      });
    });
  });

  return Object.values(statsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const setDiff = b.setsWon - b.setsLost - (a.setsWon - a.setsLost);
    if (setDiff !== 0) return setDiff;
    const gameDiff = b.gamesWon - b.gamesLost - (a.gamesWon - a.gamesLost);
    if (gameDiff !== 0) return gameDiff;
    return a.name.localeCompare(b.name);
  });
}

function runInternalTests() {
  const parsed = parseResultInput("6:4 4:6 10:8");
  console.assert(parsed?.setsA === 2, "Team A should win two sets");
  console.assert(parsed?.setsB === 1, "Team B should win one set");
  console.assert(parsed?.gamesA === 20, "Team A games should be counted");
  console.assert(parsed?.gamesB === 18, "Team B games should be counted");
  console.assert(parsed?.winner === "A", "Team A should be winner");
  console.assert(parseResultInput("") === null, "Empty result should return null");
  console.assert(addMinutesToTime("23:50", 20) === "00:10", "Time should wrap after midnight");
  console.assert(buildDefaultCourtNames(3).join(",") === "Court 1,Court 2,Court 3", "Court names should be generated");

  const demoPlayers = ["A", "B", "C", "D", "E"].map((name, index) => ({
    id: name,
    name,
    gender: index % 2 ? "w" : "m",
    strength: 3,
  }));
  const testRounds = createSchedule(demoPlayers, 2, ["Court 1"], "18:00", 30, 10);
  console.assert(testRounds.length === 2, "Schedule should create requested round count");
  console.assert(testRounds[0].matches.length === 1, "Five players and one court should create one match");
  console.assert(testRounds[0].benched.length === 1, "Five players and one court should bench one player");
}

if (typeof window !== "undefined") runInternalTests();

function StarRating({ value, onChange, interactive = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= Number(value || 0);
        const icon = <LuStar className={`h-4 w-4 ${active ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />;

        if (!interactive) return <span key={star}>{icon}</span>;

        return (
          <button key={star} type="button" onClick={() => onChange?.(star)} className="transition hover:scale-110" aria-label={`${star} Sterne`}>
            {icon}
          </button>
        );
      })}
    </div>
  );
}

function PlayerCard({ player, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
      <div>
        <div className="font-medium text-slate-900">{player.name}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            {genderLabel(player.gender)}
          </Badge>
          <StarRating value={player.strength} />
        </div>
      </div>
      {onRemove && (
        <button type="button" onClick={() => onRemove(player.id)} className="rounded-xl border border-emerald-100 p-2 text-slate-600 hover:bg-emerald-50" aria-label={`${player.name} entfernen`}>
          <LuTrash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function TeamBox({ label, team }) {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="font-semibold text-emerald-900">{label}</div>
        <Badge variant="secondary" className="rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-50">
          {sumStrength(team)} Sterne
        </Badge>
      </div>
      <div className="space-y-2">
        {team.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}

export default function TennisViererKombinationenApp() {
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [playerInput, setPlayerInput] = useState("");
  const [newPlayer, setNewPlayer] = useState("");
  const [newGender, setNewGender] = useState("m");
  const [newStrength, setNewStrength] = useState(3);
  const [roundCount, setRoundCount] = useState(5);
  const [courtCount, setCourtCount] = useState(DEFAULT_COURTS);
  const [courtNames, setCourtNames] = useState(buildDefaultCourtNames(DEFAULT_COURTS));
  const [startTime, setStartTime] = useState("18:00");
  const [matchDuration, setMatchDuration] = useState(35);
  const [breakDuration, setBreakDuration] = useState(10);

  const leaderboard = useMemo(() => computeLeaderboard(players, rounds), [players, rounds]);
  const winner = leaderboard.find((entry) => entry.points > 0);

  const totalEventEnd = useMemo(() => {
    const totalMinutes = Number(roundCount) * Number(matchDuration) + Math.max(0, Number(roundCount) - 1) * Number(breakDuration);
    return addMinutesToTime(startTime, totalMinutes);
  }, [roundCount, matchDuration, breakDuration, startTime]);

  const playerStats = useMemo(() => {
    const men = players.filter((player) => player.gender === "m").length;
    const women = players.filter((player) => player.gender === "w").length;
    const matchesPerRound = Math.min(Math.floor(players.length / 4), Number(courtCount));
    const benchedPerRound = Math.max(0, players.length - matchesPerRound * 4);
    return { men, women, matchesPerRound, benchedPerRound };
  }, [players, courtCount]);

  function addSinglePlayer() {
    const name = newPlayer.trim();
    if (!name) return;
    if (players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
      setNewPlayer("");
      return;
    }
    setPlayers((previous) => [...previous, { id: safeRandomId(), name, gender: newGender, strength: Number(newStrength) }]);
    setNewPlayer("");
    setRounds([]);
  }

  function addPlayersFromTextarea() {
    const names = playerInput
      .split(/\n|,|;/)
      .map((name) => name.trim())
      .filter(Boolean);
    const existing = new Set(players.map((player) => player.name.toLowerCase()));
    const importedPlayers = names
      .filter((name) => !existing.has(name.toLowerCase()))
      .map((name) => ({ id: safeRandomId(), name, gender: "m", strength: 3 }));
    setPlayers((previous) => [...previous, ...importedPlayers]);
    setPlayerInput("");
    setRounds([]);
  }

  function removePlayer(playerId) {
    setPlayers((previous) => previous.filter((player) => player.id !== playerId));
    setRounds([]);
  }

  function updateCourtCount(value) {
    const nextCount = Math.max(1, Math.min(12, Number(value) || 1));
    setCourtCount(nextCount);
    setCourtNames((previous) => {
      const next = [...previous];
      while (next.length < nextCount) next.push(`Court ${next.length + 1}`);
      return next.slice(0, nextCount);
    });
    setRounds([]);
  }

  function updateCourtName(index, value) {
    setCourtNames((previous) => previous.map((name, currentIndex) => (currentIndex === index ? value : name)));
    setRounds([]);
  }

  function generateDemoPlayers() {
    const names = ["Alexander", "Sophie", "Jonas", "Laura", "Ben", "Marie", "Lukas", "Anna", "Tim", "Julia", "Felix", "Leonie", "Paul", "Mia", "Noah", "Emma", "David", "Nina", "Finn", "Clara"];
    setPlayers(
      names.map((name, index) => ({
        id: safeRandomId(),
        name,
        gender: index % 2 === 0 ? "m" : "w",
        strength: (index % 5) + 1,
      }))
    );
    setRounds([]);
  }

  function generateTournament() {
    const safeRounds = Math.max(1, Math.min(12, Number(roundCount) || 5));
    const safeCourts = Math.max(1, Math.min(12, Number(courtCount) || 1));
    const safeMatchDuration = Math.max(10, Math.min(180, Number(matchDuration) || 35));
    const safeBreakDuration = Math.max(0, Math.min(60, Number(breakDuration) || 0));
    const names = courtNames.slice(0, safeCourts).map((name, index) => name.trim() || `Court ${index + 1}`);

    setRoundCount(safeRounds);
    setCourtCount(safeCourts);
    setMatchDuration(safeMatchDuration);
    setBreakDuration(safeBreakDuration);
    setCourtNames(names);
    setRounds(createSchedule(players, safeRounds, names, startTime, safeMatchDuration, safeBreakDuration));
  }

  function resetResults() {
    setRounds((previous) =>
      previous.map((round) => ({
        ...round,
        matches: round.matches.map((match) => ({ ...match, result: "", notes: "" })),
      }))
    );
  }

  function clearAll() {
    setPlayers([]);
    setRounds([]);
    setPlayerInput("");
    setNewPlayer("");
    setNewGender("m");
    setNewStrength(3);
    setRoundCount(5);
    setCourtCount(DEFAULT_COURTS);
    setCourtNames(buildDefaultCourtNames(DEFAULT_COURTS));
    setStartTime("18:00");
    setMatchDuration(35);
    setBreakDuration(10);
  }

  function updateMatchField(roundId, matchId, field, value) {
    setRounds((previous) =>
      previous.map((round) =>
        round.id !== roundId
          ? round
          : {
              ...round,
              matches: round.matches.map((match) => (match.id === matchId ? { ...match, [field]: value } : match)),
            }
      )
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#14532d,_#052e16_55%,_#022c22)] p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-600 to-lime-500 p-8 text-white">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
                  <LuSparkles className="h-4 w-4" />
                  Tennisclub Fun Cup
                </div>
                <h1 className="text-3xl font-bold md:text-4xl">Vierer-Kombinationen für Tennis-Doppel</h1>
                <p className="mt-3 max-w-3xl text-sm text-emerald-50 md:text-base">
                  Plane lockere Doppelrunden mit wechselnden Partnern, Court-Zuweisung, Pausenrotation und Gesamtwertung.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={generateTournament} disabled={players.length < 4} className="rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50">
                  <LuShuffle className="mr-2 h-4 w-4" />
                  Turnier planen
                </Button>
                <Button variant="secondary" onClick={generateDemoPlayers} className="rounded-2xl bg-emerald-950/20 text-white hover:bg-emerald-950/30">
                  Demo 20 Spieler
                </Button>
                <Button variant="secondary" onClick={resetResults} className="rounded-2xl bg-emerald-950/20 text-white hover:bg-emerald-950/30">
                  <LuRotateCcw className="mr-2 h-4 w-4" />
                  Ergebnisse leeren
                </Button>
                <Button variant="outline" onClick={clearAll} className="rounded-2xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  Alles leeren
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <Card className="rounded-3xl border-0 bg-emerald-50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <LuUsers className="h-5 w-5" />
                  Teilnehmer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Einzelnen Spieler hinzufügen</Label>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
                    <Input
                      value={newPlayer}
                      onChange={(event) => setNewPlayer(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && addSinglePlayer()}
                      placeholder="z. B. Max Mustermann"
                      className="rounded-2xl bg-white"
                    />
                    <select value={newGender} onChange={(event) => setNewGender(event.target.value)} className="rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm">
                      <option value="m">Männlich</option>
                      <option value="w">Weiblich</option>
                    </select>
                    <div className="rounded-2xl border border-emerald-200 bg-white px-3 py-2">
                      <StarRating value={newStrength} onChange={setNewStrength} interactive />
                    </div>
                    <Button onClick={addSinglePlayer} className="rounded-2xl bg-emerald-700 hover:bg-emerald-800">
                      <LuPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mehrere Namen auf einmal</Label>
                  <Textarea
                    value={playerInput}
                    onChange={(event) => setPlayerInput(event.target.value)}
                    placeholder={`Ein Name pro Zeile oder getrennt mit Komma\nAnna\nBen\nClara\nDavid`}
                    className="min-h-32 rounded-2xl bg-white"
                  />
                  <Button variant="secondary" onClick={addPlayersFromTextarea} className="rounded-2xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200">
                    Namen übernehmen
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">
                    <div>
                      <strong>Spieler:</strong> {players.length}
                    </div>
                    <div className="mt-1">
                      <strong>Männlich:</strong> {playerStats.men} | <strong>Weiblich:</strong> {playerStats.women}
                    </div>
                    <div className="mt-1">
                      {playerStats.matchesPerRound} Matches pro Runde, {playerStats.benchedPerRound} Aussetzer.
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">
                    <Label className="mb-2 block">Rundenanzahl</Label>
                    <Input type="number" min={1} max={12} value={roundCount} onChange={(event) => setRoundCount(event.target.value)} className="rounded-2xl bg-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Courts und Zeitplan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Anzahl Courts</Label>
                    <Input type="number" min={1} max={12} value={courtCount} onChange={(event) => updateCourtCount(event.target.value)} className="mt-2 rounded-2xl" />
                  </div>
                  <div>
                    <Label>Startzeit</Label>
                    <Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="mt-2 rounded-2xl" />
                  </div>
                  <div>
                    <Label>Matchdauer</Label>
                    <Input type="number" min={10} max={180} value={matchDuration} onChange={(event) => setMatchDuration(event.target.value)} className="mt-2 rounded-2xl" />
                  </div>
                  <div>
                    <Label>Pause</Label>
                    <Input type="number" min={0} max={60} value={breakDuration} onChange={(event) => setBreakDuration(event.target.value)} className="mt-2 rounded-2xl" />
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <div className="mb-3 flex items-center gap-2 font-semibold text-emerald-900">
                    <LuClock3 className="h-4 w-4" />
                    Ablauf
                  </div>
                  <div className="text-sm text-slate-700">
                    Start: <strong>{startTime}</strong> · Ende ca.: <strong>{totalEventEnd}</strong>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {courtNames.map((courtName, index) => (
                    <div key={`court-${index}`}>
                      <Label>{`Court ${index + 1}`}</Label>
                      <Input value={courtName} onChange={(event) => updateCourtName(index, event.target.value)} className="mt-2 rounded-2xl" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="px-6 pb-6">
            <Card className="rounded-3xl border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Teilnehmerliste</CardTitle>
              </CardHeader>
              <CardContent>
                {players.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-emerald-200 p-8 text-center text-slate-500">Noch keine Spieler vorhanden.</div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {players.map((player) => (
                      <PlayerCard key={player.id} player={player} onRemove={removePlayer} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {winner && (
          <Card className="rounded-[2rem] border-0 bg-gradient-to-r from-amber-50 via-white to-amber-100 shadow-2xl">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-400 p-4 text-white shadow-lg">
                  <LuMedal className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-amber-700">Aktueller Gesamtsieger</div>
                  <div className="text-2xl font-bold text-slate-900">{winner.name}</div>
                  <div className="text-sm text-slate-600">
                    {winner.points} Punkte · {winner.wins} Siege
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-[2rem] border-0 bg-white/95 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <LuCalendarRange className="h-5 w-5" />
              Rundenplan und Ergebnisse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rounds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-200 p-10 text-center text-slate-500">
                {players.length < 4 ? "Mindestens 4 Spieler eintragen, dann kann ein Turnier geplant werden." : "Noch kein Turnier geplant."}
              </div>
            ) : (
              <Tabs defaultValue={rounds[0]?.id} className="space-y-5">
                <TabsList className="h-auto w-full flex-wrap justify-start rounded-2xl bg-emerald-50 p-2">
                  {rounds.map((round) => (
                    <TabsTrigger key={round.id} value={round.id} className="rounded-2xl data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
                      Runde {round.roundNumber}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {rounds.map((round) => (
                  <TabsContent key={round.id} value={round.id} className="space-y-5">
                    <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm">
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-semibold text-emerald-900">Runde {round.roundNumber}</h3>
                          <p className="text-sm text-slate-500">
                            {round.startTime} bis {round.endTime} {round.breakUntil ? `· Wechsel bis ${round.breakUntil}` : "· Turnierende"}
                          </p>
                        </div>
                        <Badge className="rounded-xl bg-emerald-700">{round.matches.length} Matches</Badge>
                      </div>

                      <div className="grid gap-5 xl:grid-cols-2">
                        {round.matches.map((match) => (
                          <div key={match.id} className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <h4 className="text-lg font-semibold text-emerald-900">{match.courtName}</h4>
                                <p className="text-sm text-slate-500">Doppelbegegnung</p>
                              </div>
                              <LuSwords className="h-5 w-5 text-emerald-700" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <TeamBox label="Team A" team={match.teamA} />
                              <TeamBox label="Team B" team={match.teamB} />
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Ergebnis</Label>
                                <Input
                                  value={match.result}
                                  onChange={(event) => updateMatchField(round.id, match.id, "result", event.target.value)}
                                  placeholder="z. B. 6:4 4:6 10:8"
                                  className="rounded-2xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Notiz</Label>
                                <Input
                                  value={match.notes}
                                  onChange={(event) => updateMatchField(round.id, match.id, "notes", event.target.value)}
                                  placeholder="optional"
                                  className="rounded-2xl"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                        <div className="mb-3 font-semibold text-emerald-900">Aussetzer</div>
                        {round.benched.length === 0 ? (
                          <div className="text-sm text-slate-500">Keine Aussetzer. Alle Spieler sind eingeplant.</div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {round.benched.map((player) => (
                              <Badge key={player.id} variant="secondary" className="rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-100">
                                {player.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 bg-white/95 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <LuTrophy className="h-5 w-5" />
              Gesamtwertung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-200 p-8 text-center text-slate-500">Noch keine Spieler für eine Wertung vorhanden.</div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-emerald-100">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-emerald-50 text-emerald-900">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Spieler</th>
                      <th className="px-4 py-3">Stärke</th>
                      <th className="px-4 py-3">Punkte</th>
                      <th className="px-4 py-3">S/U/N</th>
                      <th className="px-4 py-3">Sätze</th>
                      <th className="px-4 py-3">Games</th>
                      <th className="px-4 py-3">Gespielt</th>
                      <th className="px-4 py-3">Pause</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100 bg-white">
                    {leaderboard.map((entry, index) => {
                      const setDiff = entry.setsWon - entry.setsLost;
                      const gameDiff = entry.gamesWon - entry.gamesLost;
                      return (
                        <tr key={entry.id} className={index === 0 && entry.points > 0 ? "bg-amber-50/70" : ""}>
                          <td className="px-4 py-3 font-semibold text-slate-700">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{entry.name}</div>
                            <div className="text-xs text-slate-500">{genderLabel(entry.gender)}</div>
                          </td>
                          <td className="px-4 py-3">
                            <StarRating value={entry.strength} />
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-800">{entry.points}</td>
                          <td className="px-4 py-3">
                            {entry.wins}/{entry.draws}/{entry.losses}
                          </td>
                          <td className="px-4 py-3">
                            {entry.setsWon}:{entry.setsLost} ({setDiff >= 0 ? "+" : ""}
                            {setDiff})
                          </td>
                          <td className="px-4 py-3">
                            {entry.gamesWon}:{entry.gamesLost} ({gameDiff >= 0 ? "+" : ""}
                            {gameDiff})
                          </td>
                          <td className="px-4 py-3">{entry.playedRounds}</td>
                          <td className="px-4 py-3">{entry.pauseRounds}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
