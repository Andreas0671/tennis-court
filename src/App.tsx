import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppHeader } from "@/components/AppHeader/AppHeader";
import { CourtSetup } from "@/components/CourtSetup/CourtSetup";
import { LeaderboardTable } from "@/components/LeaderboardTable/LeaderboardTable";
import { PlayerSetup } from "@/components/PlayerSetup/PlayerSetup";
import { PrintSectionButton } from "@/components/PrintSectionButton/PrintSectionButton";
import { RoundPanel } from "@/components/RoundPanel/RoundPanel";
import { WinnerBanner } from "@/components/WinnerBanner/WinnerBanner";
import { useTournament } from "@/hooks/useTournament";
import { LuCalendarRange, LuTrophy } from "react-icons/lu";

export default function App() {
  const t = useTournament();
  const [selectedRoundId, setSelectedRoundId] = useState<string | undefined>(t.rounds[0]?.id);
  const currentRoundId = selectedRoundId && t.rounds.some((round) => round.id === selectedRoundId)
    ? selectedRoundId
    : t.rounds[0]?.id;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#14532d,_#052e16_55%,_#022c22)] p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <AppHeader
            canGenerate={t.players.length >= 4}
            onGenerate={t.generateTournament}
            onDemo={t.generateDemo}
            onResetResults={t.resetResults}
            onClearAll={t.clearAll}
          />
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <PlayerSetup
              players={t.players}
              playerInput={t.playerInput}
              newPlayer={t.newPlayer}
              newGender={t.newGender}
              newStrength={t.newStrength}
              stats={t.playerStats}
              roundCount={t.roundCount}
              onPlayerInputChange={t.setPlayerInput}
              onNewPlayerChange={t.setNewPlayer}
              onNewGenderChange={t.setNewGender}
              onNewStrengthChange={t.setNewStrength}
              onRoundCountChange={(v) => t.setRoundCount(Number(v))}
              onAddSingle={t.addSinglePlayer}
              onAddBulk={t.addBulkPlayers}
              onRemove={t.removePlayer}
            />
            <CourtSetup
              courtCount={t.courtCount}
              courtNames={t.courtNames}
              startTime={t.startTime}
              matchDuration={t.matchDuration}
              breakDuration={t.breakDuration}
              totalEventEnd={t.totalEventEnd}
              onCourtCountChange={t.updateCourtCount}
              onCourtNameChange={t.updateCourtName}
              onStartTimeChange={t.setStartTime}
              onMatchDurationChange={(v) => t.setMatchDuration(Number(v))}
              onBreakDurationChange={(v) => t.setBreakDuration(Number(v))}
            />
          </div>
        </section>

        {t.winner && <WinnerBanner winner={t.winner} />}

        <Card className="rounded-[2rem] border-0 bg-white/95 shadow-2xl">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <LuCalendarRange className="h-5 w-5" />
              Rundenplan und Ergebnisse
            </CardTitle>
            {currentRoundId && (
              <PrintSectionButton
                targetId={`round-print-${currentRoundId}`}
                label="Aktuelle Runde drucken"
              />
            )}
          </CardHeader>
          <CardContent>
            {t.rounds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-200 p-10 text-center text-slate-500">
                {t.players.length < 4
                  ? "Mindestens 4 Spieler eintragen, dann kann ein Turnier geplant werden."
                  : "Noch kein Turnier geplant."}
              </div>
            ) : (
              <Tabs value={currentRoundId} onValueChange={setSelectedRoundId} className="space-y-5">
                <TabsList className="h-auto w-full flex-wrap justify-start rounded-2xl bg-emerald-50 p-2">
                  {t.rounds.map((round) => (
                    <TabsTrigger key={round.id} value={round.id} className="rounded-2xl data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
                      Runde {round.roundNumber}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {t.rounds.map((round) => (
                  <TabsContent key={round.id} value={round.id} className="space-y-5">
                    <div id={`round-print-${round.id}`}>
                      <RoundPanel round={round} onFieldChange={t.updateMatchField} />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 bg-white/95 shadow-2xl">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <LuTrophy className="h-5 w-5" />
              Gesamtwertung
            </CardTitle>
            {t.leaderboard.length > 0 && (
              <PrintSectionButton targetId="leaderboard-print" label="Gesamtwertung drucken" />
            )}
          </CardHeader>
          <CardContent id="leaderboard-print">
            <LeaderboardTable leaderboard={t.leaderboard} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
