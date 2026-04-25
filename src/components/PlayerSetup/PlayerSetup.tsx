import type { Player } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlayerCard } from "@/components/PlayerCard/PlayerCard";
import { StarRating } from "@/components/StarRating/StarRating";
import { LuPlus, LuUsers } from "react-icons/lu";

interface PlayerSetupProps {
  players: Player[];
  playerInput: string;
  newPlayer: string;
  newGender: string;
  newStrength: number;
  stats: { men: number; women: number; matchesPerRound: number; benchedPerRound: number };
  roundCount: number;
  readOnly?: boolean;
  onPlayerInputChange: (v: string) => void;
  onNewPlayerChange: (v: string) => void;
  onNewGenderChange: (v: string) => void;
  onNewStrengthChange: (v: number) => void;
  onRoundCountChange: (v: string) => void;
  onAddSingle: () => void;
  onAddBulk: () => void;
  onRemove: (id: string) => void;
}

export function PlayerSetup(props: PlayerSetupProps) {
  const { players, playerInput, newPlayer, newGender, newStrength, stats, roundCount, readOnly = false } = props;

  return (
    <Card className="rounded-3xl border-0 bg-emerald-50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-900">
          <LuUsers className="h-5 w-5" />
          Teilnehmer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Einzelnen Spieler hinzufuegen</Label>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <Input
              value={newPlayer}
              onChange={(e) => props.onNewPlayerChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !readOnly && props.onAddSingle()}
              placeholder="z. B. Max Mustermann"
              className="rounded-2xl bg-white"
              disabled={readOnly}
            />
            <select
              value={newGender}
              onChange={(e) => props.onNewGenderChange(e.target.value)}
              className="rounded-2xl border border-emerald-200 bg-white px-3 py-2 text-sm"
              disabled={readOnly}
            >
              <option value="m">Maennlich</option>
              <option value="w">Weiblich</option>
            </select>
            <div className="rounded-2xl border border-emerald-200 bg-white px-3 py-2">
              <StarRating value={newStrength} onChange={props.onNewStrengthChange} interactive={!readOnly} />
            </div>
            <Button onClick={props.onAddSingle} className="rounded-2xl bg-emerald-700 hover:bg-emerald-800" disabled={readOnly}>
              <LuPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mehrere Namen auf einmal</Label>
          <Textarea
            value={playerInput}
            onChange={(e) => props.onPlayerInputChange(e.target.value)}
            placeholder={"Ein Name pro Zeile oder getrennt mit Komma\nAnna\nBen\nClara\nDavid"}
            className="min-h-32 rounded-2xl bg-white"
            disabled={readOnly}
          />
          <Button variant="secondary" onClick={props.onAddBulk} className="rounded-2xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200" disabled={readOnly}>
            Namen uebernehmen
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">
            <div><strong>Spieler:</strong> {players.length}</div>
            <div className="mt-1"><strong>Maennlich:</strong> {stats.men} | <strong>Weiblich:</strong> {stats.women}</div>
            <div className="mt-1">{stats.matchesPerRound} Matches pro Runde, {stats.benchedPerRound} Aussetzer.</div>
          </div>
          <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">
            <Label className="mb-2 block">Rundenanzahl</Label>
            <Input type="number" min={1} max={12} value={roundCount} onChange={(e) => props.onRoundCountChange(e.target.value)} className="rounded-2xl bg-white" disabled={readOnly} />
          </div>
        </div>

        {players.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {players.map((p) => <PlayerCard key={p.id} player={p} onRemove={readOnly ? undefined : props.onRemove} />)}
          </div>
        )}
        {players.length === 0 && (
          <div className="rounded-2xl border border-dashed border-emerald-200 p-8 text-center text-slate-500">Noch keine Spieler vorhanden.</div>
        )}
      </CardContent>
    </Card>
  );
}
