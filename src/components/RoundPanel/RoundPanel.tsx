import { useMemo, useState } from "react";
import { LuUserX } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/MatchCard/MatchCard";
import type { Match, Round } from "@/types";

interface RoundPanelProps {
  round: Round;
  readOnly?: boolean;
  showCourtNames?: boolean;
  onFieldChange: (roundId: string, matchId: string, field: "result" | "notes", value: string) => void;
  onPlayerDropout?: (roundId: string, playerId: string) => void;
}

export function RoundPanel({ round, readOnly = false, showCourtNames = true, onFieldChange, onPlayerDropout }: RoundPanelProps) {
  const [dropoutPlayerId, setDropoutPlayerId] = useState("");
  const roundPlayers = useMemo(() => {
    const seen = new Set<string>();
    return [
      ...round.matches.flatMap((match) => [...match.teamA, ...match.teamB]),
      ...round.benched,
    ].filter((player) => {
      if (seen.has(player.id)) return false;
      seen.add(player.id);
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [round]);

  function handleDropout() {
    if (!dropoutPlayerId || !onPlayerDropout) return;
    onPlayerDropout(round.id, dropoutPlayerId);
    setDropoutPlayerId("");
  }

  return (
    <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold text-emerald-900">Runde {round.roundNumber}</h3>
          <p className="text-sm text-slate-500">
            {round.startTime} bis {round.endTime}
            {round.breakUntil ? ` · Wechsel bis ${round.breakUntil}` : " · Turnierende"}
          </p>
        </div>
        <Badge className="rounded-xl bg-emerald-700">{round.matches.length} Matches</Badge>
      </div>

      {!readOnly && onPlayerDropout && roundPlayers.length > 0 && (
        <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="min-w-56 flex-1 space-y-2">
            <label className="text-sm font-semibold text-amber-950" htmlFor={`dropout-${round.id}`}>Spieler fällt ab dieser Runde aus</label>
            <select
              id={`dropout-${round.id}`}
              value={dropoutPlayerId}
              onChange={(event) => setDropoutPlayerId(event.target.value)}
              className="h-9 w-full rounded-2xl border border-amber-200 bg-white px-3 text-sm"
            >
              <option value="">Spieler auswählen</option>
              {roundPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} ({player.gender === "m" ? "Herren" : "Damen"}, Stärke {player.strength})
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleDropout}
            disabled={!dropoutPlayerId}
            className="rounded-2xl bg-amber-200 text-amber-950 hover:bg-amber-300"
          >
            <LuUserX className="h-4 w-4" />
            Ersetzen
          </Button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {round.matches.map((match: Match) => (
          <MatchCard key={match.id} match={match} roundId={round.id} readOnly={readOnly} showCourtName={showCourtNames} onFieldChange={onFieldChange} />
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

      {(round.absent?.length ?? 0) > 0 && (
        <div className="mt-5 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
          <div className="mb-3 font-semibold text-rose-900">Ausfälle</div>
          <div className="flex flex-wrap gap-2">
            {round.absent?.map((player) => (
              <Badge key={player.id} variant="destructive" className="rounded-xl">
                {player.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
