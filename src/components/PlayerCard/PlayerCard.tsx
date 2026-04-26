import { LuTrash2 } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating/StarRating";
import { genderLabel } from "@/lib/helpers";
import type { Player } from "@/types";

interface PlayerCardProps {
  player: Player;
  onRemove?: (id: string) => void;
  showStrength?: boolean;
}

export function PlayerCard({ player, onRemove, showStrength = true }: PlayerCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
      <div>
        <div className="font-medium text-slate-900">{player.name}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            {genderLabel(player.gender)}
          </Badge>
          {showStrength && <StarRating value={player.strength} />}
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(player.id)}
          className="rounded-xl border border-emerald-100 p-2 text-slate-600 hover:bg-emerald-50"
          aria-label={`${player.name} entfernen`}
        >
          <LuTrash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
