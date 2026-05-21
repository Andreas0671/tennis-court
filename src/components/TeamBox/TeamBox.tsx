import { Badge } from "@/components/ui/badge";
import { PlayerCard } from "@/components/PlayerCard/PlayerCard";
import { sumStrength } from "@/lib/helpers";
import type { Player } from "@/types";

interface TeamBoxProps {
  label: string;
  team: Player[];
  showStrength?: boolean;
}

export function TeamBox({ label, team, showStrength = true }: TeamBoxProps) {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="font-semibold text-emerald-900">{label}</div>
        {showStrength && (
          <Badge variant="secondary" className="rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-50">
            {sumStrength(team)} Sterne
          </Badge>
        )}
      </div>
      <div className="space-y-2">
        {team.map((player) => (
          <PlayerCard key={player.id} player={player} showStrength={showStrength} />
        ))}
      </div>
    </div>
  );
}
