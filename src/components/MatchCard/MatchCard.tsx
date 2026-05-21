import { LuSwords } from "react-icons/lu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamBox } from "@/components/TeamBox/TeamBox";
import type { Match } from "@/types";

interface MatchCardProps {
  match: Match;
  roundId: string;
  readOnly?: boolean;
  showCourtName?: boolean;
  onFieldChange: (roundId: string, matchId: string, field: "result" | "notes", value: string) => void;
}

export function MatchCard({ match, roundId, readOnly = false, showCourtName = true, onFieldChange }: MatchCardProps) {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          {showCourtName ? (
            <>
              <h4 className="text-lg font-semibold text-emerald-900">{match.courtName}</h4>
              <p className="text-sm text-slate-500">Doppelbegegnung</p>
            </>
          ) : (
            <h4 className="text-lg font-semibold text-emerald-900">Doppelbegegnung</h4>
          )}
        </div>
        <LuSwords className="h-5 w-5 text-emerald-700" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TeamBox label="Team A" team={match.teamA} showStrength={!readOnly} />
        <TeamBox label="Team B" team={match.teamB} showStrength={!readOnly} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Ergebnis</Label>
          <Input
            value={match.result}
            onChange={(e) => onFieldChange(roundId, match.id, "result", e.target.value)}
            placeholder="z. B. 6:4 4:6 10:8"
            className="rounded-2xl"
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <Label>Notiz</Label>
          <Input
            value={match.notes}
            onChange={(e) => onFieldChange(roundId, match.id, "notes", e.target.value)}
            placeholder="optional"
            className="rounded-2xl"
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
