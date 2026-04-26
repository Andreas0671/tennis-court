import { StarRating } from "@/components/StarRating/StarRating";
import { genderLabel } from "@/lib/helpers";
import type { PlayerStats } from "@/types";

interface LeaderboardTableProps {
  leaderboard: PlayerStats[];
  showStrength?: boolean;
}

export function LeaderboardTable({ leaderboard, showStrength = true }: LeaderboardTableProps) {
  if (leaderboard.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-200 p-8 text-center text-slate-500">
        Noch keine Spieler für eine Wertung vorhanden.
      </div>
    );
  }

  const headers = ["#", "Spieler", ...(showStrength ? ["Stärke"] : []), "Punkte", "S/U/N", "Sätze", "Games", "Gespielt", "Pause"];

  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-100">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-emerald-50 text-emerald-900">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">{h}</th>
            ))}
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
                {showStrength && <td className="px-4 py-3"><StarRating value={entry.strength} /></td>}
                <td className="px-4 py-3 font-bold text-emerald-800">{entry.points}</td>
                <td className="px-4 py-3">{entry.wins}/{entry.draws}/{entry.losses}</td>
                <td className="px-4 py-3">{entry.setsWon}:{entry.setsLost} ({setDiff >= 0 ? "+" : ""}{setDiff})</td>
                <td className="px-4 py-3">{entry.gamesWon}:{entry.gamesLost} ({gameDiff >= 0 ? "+" : ""}{gameDiff})</td>
                <td className="px-4 py-3">{entry.playedRounds}</td>
                <td className="px-4 py-3">{entry.pauseRounds}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
