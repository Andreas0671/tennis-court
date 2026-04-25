import { useCallback, useEffect, useMemo, useState } from "react";
import { LuCalendarRange, LuLogIn, LuTrophy } from "react-icons/lu";
import { AppHeader } from "@/components/AppHeader/AppHeader";
import { CourtSetup } from "@/components/CourtSetup/CourtSetup";
import { LeaderboardTable } from "@/components/LeaderboardTable/LeaderboardTable";
import { PlayerSetup } from "@/components/PlayerSetup/PlayerSetup";
import { RoundPanel } from "@/components/RoundPanel/RoundPanel";
import { WinnerBanner } from "@/components/WinnerBanner/WinnerBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTournament } from "@/hooks/useTournament";
import { createDefaultTournamentState } from "@/lib/tournamentStorage";
import { ApiError, checkSession, getAdminTournament, getPublicTournament, login, logout, saveTournament } from "@/lib/tournamentApi";
import type { FormEvent } from "react";
import type { SavedTournament } from "@/types";

const DEFAULT_SLUG = "clubabend";
const DEFAULT_TITLE = "TC Heide 1975";
const VIEW_REFRESH_MS = 30_000;

type RouteState = { mode: "admin" | "view"; slug: string };

function parseRoute(pathname: string, hash: string): RouteState {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  if (segments[0] === "admin") return { mode: "admin", slug: segments[1] ?? DEFAULT_SLUG };
  if (segments[0] === "view") return { mode: "view", slug: segments[1] ?? DEFAULT_SLUG };

  const hashSegments = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (hashSegments[0] === "admin") return { mode: "admin", slug: hashSegments[1] ?? DEFAULT_SLUG };
  if (hashSegments[0] === "view") return { mode: "view", slug: hashSegments[1] ?? DEFAULT_SLUG };

  return { mode: "view", slug: DEFAULT_SLUG };
}

function routePath(route: RouteState): string {
  return `/${route.mode}/${route.slug}`;
}

function formatUpdatedAt(value: string | null): string {
  if (!value) return "noch nicht gespeichert";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Es ist ein unbekannter Fehler aufgetreten.";
}

const noop = () => {};

export default function App() {
  const t = useTournament();
  const { replaceState } = t;
  const [route, setRoute] = useState<RouteState>(() => parseRoute(window.location.pathname, window.location.hash));
  const [ready, setReady] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loginName, setLoginName] = useState("Andreas");
  const [password, setPassword] = useState("");
  const [lastSavedState, setLastSavedState] = useState(() => JSON.stringify(createDefaultTournamentState()));
  const [activeRoundId, setActiveRoundId] = useState<string | undefined>(undefined);

  const isAdminRoute = route.mode === "admin";
  const canEdit = isAdminRoute && !!adminUser;
  const isDirty = canEdit && !loading && JSON.stringify(t.state) !== lastSavedState;

  const applyTournament = useCallback((tournament: SavedTournament, message?: string) => {
    setTitle(tournament.title || DEFAULT_TITLE);
    setUpdatedAt(tournament.updatedAt);
    replaceState(tournament.state);
    setLastSavedState(JSON.stringify(tournament.state));
    setActiveRoundId(tournament.state.rounds[0]?.id);
    if (message) setStatus(message);
  }, [replaceState]);

  const loadPublic = useCallback(async (slug: string, quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const tournament = await getPublicTournament(slug);
      applyTournament(tournament, `Live-Ansicht aktualisiert: ${formatUpdatedAt(tournament.updatedAt)}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [applyTournament]);

  const loadAdmin = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const tournament = await getAdminTournament(slug);
      applyTournament(tournament, `Admin-Ansicht geladen. Letzte Speicherung: ${formatUpdatedAt(tournament.updatedAt)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        const emptyState = createDefaultTournamentState();
        setTitle(DEFAULT_TITLE);
        setUpdatedAt(null);
        replaceState(emptyState);
        setLastSavedState(JSON.stringify(emptyState));
        setActiveRoundId(undefined);
        setStatus("Neues Turnier vorbereitet. Nach dem ersten Speichern ist es fuer Zuschauer sichtbar.");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [replaceState, applyTournament]);

  useEffect(() => {
    const updateRoute = () => setRoute(parseRoute(window.location.pathname, window.location.hash));
    window.addEventListener("popstate", updateRoute);
    window.addEventListener("hashchange", updateRoute);
    return () => {
      window.removeEventListener("popstate", updateRoute);
      window.removeEventListener("hashchange", updateRoute);
    };
  }, []);

  const navigate = useCallback((nextRoute: RouteState) => {
    window.history.pushState(null, "", routePath(nextRoute));
    setRoute(nextRoute);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      setStatus(null);
      setError(null);

      if (route.mode === "view") {
        setReady(true);
        setAdminUser(null);
        await loadPublic(route.slug);
        return;
      }

      setLoading(true);
      try {
        const session = await checkSession();
        if (!mounted) return;
        setReady(true);
        setAdminUser(session.authenticated ? session.username : null);
        if (session.authenticated) {
          await loadAdmin(route.slug);
        } else {
          const emptyState = createDefaultTournamentState();
          replaceState(emptyState);
          setLastSavedState(JSON.stringify(emptyState));
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        setReady(true);
        setAdminUser(null);
        setError(errorMessage(err));
        setLoading(false);
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [route.mode, route.slug, loadAdmin, loadPublic, replaceState]);

  useEffect(() => {
    if (route.mode !== "view") return undefined;
    const timer = window.setInterval(() => {
      void loadPublic(route.slug, true);
    }, VIEW_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [loadPublic, route.mode, route.slug]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const session = await login(loginName, password);
      setAdminUser(session.username);
      setPassword("");
      await loadAdmin(route.slug);
    } catch (err) {
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const tournament = await saveTournament({ slug: route.slug, title, state: t.state });
      applyTournament(tournament, `Gespeichert: ${formatUpdatedAt(tournament.updatedAt)}`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setAdminUser(null);
      navigate({ mode: "view", slug: route.slug });
    }
  }

  const currentRoundId = useMemo(() => {
    if (activeRoundId && t.rounds.some((round) => round.id === activeRoundId)) return activeRoundId;
    return t.rounds[0]?.id;
  }, [activeRoundId, t.rounds]);

  if (isAdminRoute && ready && !adminUser) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#14532d,_#052e16_55%,_#022c22)] p-6 text-slate-900">
        <div className="mx-auto max-w-3xl">
          <Card className="overflow-hidden rounded-[2rem] border-0 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-600 to-lime-500 p-8 text-white">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]">
                <LuLogIn className="h-4 w-4" />
                Admin-Login
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">Turnierverwaltung</h1>
              <p className="mt-3 max-w-2xl text-sm text-emerald-50 md:text-base">
                Nur der Admin kann Spieler, Runden und Ergebnisse bearbeiten. Zuschauer bleiben auf der Live-Ansicht.
              </p>
            </div>
            <CardContent className="space-y-6 p-6">
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="admin-name">Benutzername</Label>
                  <Input id="admin-name" value={loginName} onChange={(e) => setLoginName(e.target.value)} className="rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Passwort</Label>
                  <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-2xl" />
                </div>
                {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={loading} className="rounded-2xl bg-emerald-700 hover:bg-emerald-800">
                    {loading ? "Prueft..." : "Einloggen"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => navigate({ mode: "view", slug: route.slug })} className="rounded-2xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200">
                    Zur Live-Ansicht
                  </Button>
                </div>
              </form>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                Zuschauer-Link: <button type="button" onClick={() => navigate({ mode: "view", slug: route.slug })} className="font-semibold underline underline-offset-4">{routePath({ mode: "view", slug: route.slug })}</button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#14532d,_#052e16_55%,_#022c22)] p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
          <AppHeader
            mode={canEdit ? "admin" : "view"}
            adminUsername={adminUser}
            isDirty={isDirty}
            isSaving={saving}
            canGenerate={t.players.length >= 4}
            onSave={handleSave}
            onGenerate={t.generateTournament}
            onDemo={t.generateDemo}
            onResetResults={t.resetResults}
            onClearAll={t.clearAll}
            onRefresh={() => void loadPublic(route.slug)}
            onOpenAdmin={() => navigate({ mode: "admin", slug: route.slug })}
            onLogout={() => void handleLogout()}
          />
          <div className="grid gap-4 border-b border-emerald-100 bg-emerald-50/70 px-6 py-4 text-sm text-emerald-950 md:grid-cols-[1fr_auto]">
            <div className="space-y-1">
              <div><strong>Turnier:</strong> {route.slug}</div>
              <div><strong>Titel:</strong> {canEdit ? <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 max-w-2xl rounded-2xl bg-white" /> : title}</div>
              <div><strong>Letzte Speicherung:</strong> {formatUpdatedAt(updatedAt)}</div>
              {status && <div>{status}</div>}
              {error && <div className="text-rose-700">{error}</div>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => navigate({ mode: "view", slug: route.slug })} className="rounded-2xl bg-white text-emerald-900 hover:bg-emerald-100">
                Zuschaueransicht
              </Button>
              {!canEdit && (
                <Button variant="secondary" onClick={() => navigate({ mode: "admin", slug: route.slug })} className="rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800">
                  Admin-Modus
                </Button>
              )}
            </div>
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <PlayerSetup
              players={t.players}
              playerInput={t.playerInput}
              newPlayer={t.newPlayer}
              newGender={t.newGender}
              newStrength={t.newStrength}
              readOnly={!canEdit}
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
              readOnly={!canEdit}
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <LuCalendarRange className="h-5 w-5" />
              Rundenplan und Ergebnisse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="rounded-2xl border border-dashed border-emerald-200 p-10 text-center text-slate-500">Daten werden geladen...</div>
            ) : t.rounds.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-emerald-200 p-10 text-center text-slate-500">
                {canEdit ? "Noch kein Turnier geplant. Spieler anlegen und dann speichern." : "Noch kein veroeffentlichter Turnierplan vorhanden."}
              </div>
            ) : (
              <Tabs value={currentRoundId} onValueChange={setActiveRoundId} className="space-y-5">
                <TabsList className="h-auto w-full flex-wrap justify-start rounded-2xl bg-emerald-50 p-2">
                  {t.rounds.map((round) => (
                    <TabsTrigger key={round.id} value={round.id} className="rounded-2xl data-[state=active]:bg-emerald-700 data-[state=active]:text-white">
                      Runde {round.roundNumber}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {t.rounds.map((round) => (
                  <TabsContent key={round.id} value={round.id} className="space-y-5">
                    <RoundPanel round={round} readOnly={!canEdit} onFieldChange={canEdit ? t.updateMatchField : noop} />
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
            <LeaderboardTable leaderboard={t.leaderboard} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
