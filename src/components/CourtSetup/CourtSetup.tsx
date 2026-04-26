import { LuClock3 } from "react-icons/lu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CourtSetupProps {
  courtCount: number;
  courtNames: string[];
  startTime: string;
  matchDuration: number;
  breakDuration: number;
  totalEventEnd: string;
  readOnly?: boolean;
  hideCourtNames?: boolean;
  onCourtCountChange: (v: string) => void;
  onCourtNameChange: (index: number, v: string) => void;
  onStartTimeChange: (v: string) => void;
  onMatchDurationChange: (v: string) => void;
  onBreakDurationChange: (v: string) => void;
}

export function CourtSetup(props: CourtSetupProps) {
  const { courtNames, startTime, matchDuration, breakDuration, courtCount, totalEventEnd, readOnly = false, hideCourtNames = false } = props;

  return (
    <Card className="rounded-3xl border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Courts und Zeitplan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Anzahl Courts</Label>
            <Input type="number" min={1} max={12} value={courtCount} onChange={(e) => props.onCourtCountChange(e.target.value)} className="mt-2 rounded-2xl" disabled={readOnly} />
          </div>
          <div>
            <Label>Startzeit</Label>
            <Input type="time" value={startTime} onChange={(e) => props.onStartTimeChange(e.target.value)} className="mt-2 rounded-2xl" disabled={readOnly} />
          </div>
          <div>
            <Label>Matchdauer (Min.)</Label>
            <Input type="number" min={10} max={180} value={matchDuration} onChange={(e) => props.onMatchDurationChange(e.target.value)} className="mt-2 rounded-2xl" disabled={readOnly} />
          </div>
          <div>
            <Label>Pause (Min.)</Label>
            <Input type="number" min={0} max={60} value={breakDuration} onChange={(e) => props.onBreakDurationChange(e.target.value)} className="mt-2 rounded-2xl" disabled={readOnly} />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
          <div className="mb-3 flex items-center gap-2 font-semibold text-emerald-900">
            <LuClock3 className="h-4 w-4" />
            Ablauf
          </div>
          <div className="text-sm text-slate-700">
            Start: <strong>{startTime}</strong> - Ende ca.: <strong>{totalEventEnd}</strong>
          </div>
        </div>

        {!hideCourtNames && (
          <div className="grid gap-3 md:grid-cols-2">
            {courtNames.map((name, i) => (
              <div key={`court-${i}`}>
                <Label>{`Court ${i + 1}`}</Label>
                <Input value={name} onChange={(e) => props.onCourtNameChange(i, e.target.value)} className="mt-2 rounded-2xl" disabled={readOnly} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
