import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/components/MatchCard/MatchCard";
import type { Match, Round } from "@/types";

interface RoundPanelProps {
  round: Round;
  readOnly?: boolean;
  onFieldChange: (roundId: string, matchId: string, field: "result" | "notes", value: string) => void;
}

export function RoundPanel({ round, readOnly = false, onFieldChange }: RoundPanelProps) {
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

      <div className="grid gap-5 xl:grid-cols-2">
        {round.matches.map((match: Match) => (
          <MatchCard key={match.id} match={match} roundId={round.id} readOnly={readOnly} onFieldChange={onFieldChange} />
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
  );
}
