import { LuLogOut, LuRefreshCw, LuRotateCcw, LuSave, LuShuffle, LuSparkles } from "react-icons/lu";
import clubLogo from "@/assets/club-logo-transparent.png";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  mode?: "admin" | "view";
  compact?: boolean;
  adminUsername?: string | null;
  isDirty?: boolean;
  isSaving?: boolean;
  canGenerate: boolean;
  onSave?: () => void;
  onGenerate: () => void;
  onDemo: () => void;
  onResetResults: () => void;
  onClearAll: () => void;
  onRefresh?: () => void;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export function AppHeader({
  mode = "admin",
  compact = false,
  adminUsername,
  isDirty = false,
  isSaving = false,
  canGenerate,
  onSave,
  onGenerate,
  onDemo,
  onResetResults,
  onClearAll,
  onRefresh,
  onOpenAdmin,
  onLogout,
}: AppHeaderProps) {
  const isAdmin = mode === "admin";

  return (
    <div className={`relative bg-gradient-to-r from-emerald-800 via-emerald-600 to-lime-500 text-white ${compact ? "p-4 sm:p-6 md:p-8" : "p-8"}`}>
      <img
        src={clubLogo}
        alt="TC Heide 1975 e.V. Vereinslogo"
        className={`absolute right-4 top-4 object-contain drop-shadow-lg sm:right-6 sm:top-6 ${compact ? "h-16 w-16 sm:h-20 sm:w-20" : "h-20 w-20 sm:h-24 sm:w-24"}`}
      />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className={compact ? "pr-20 sm:pr-24 lg:pr-28" : "pr-24 sm:pr-28 lg:pr-32"}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] sm:px-4 sm:tracking-[0.2em]">
            <LuSparkles className="h-4 w-4" />
            {isAdmin ? `Admin${adminUsername ? `: ${adminUsername}` : ""}` : "Live-Ansicht"}
          </div>
          <h1 className={`${compact ? "text-2xl sm:text-3xl md:text-4xl" : "text-3xl md:text-4xl"} font-bold`}>Vierer-Kombinationen fuer Tennis-Doppel</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-emerald-50 md:text-base">
            {isAdmin
              ? "Plane lockere Doppelrunden mit wechselnden Partnern, Court-Zuweisung, Pausenrotation und Gesamtwertung."
              : "Live-Rundenplan mit Ergebnissen, Aussetzern und Gesamtwertung."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <>
              <Button onClick={onSave} disabled={!onSave || isSaving || !isDirty} className="rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50">
                <LuSave className="mr-2 h-4 w-4" />
                {isSaving ? "Speichert..." : "Speichern"}
              </Button>
              <Button onClick={onGenerate} disabled={!canGenerate} className="rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50">
                <LuShuffle className="mr-2 h-4 w-4" />
                Turnier planen
              </Button>
              <Button variant="secondary" onClick={onDemo} className="rounded-2xl bg-emerald-950/20 text-white hover:bg-emerald-950/30">
                Demo 20 Spieler
              </Button>
              <Button variant="secondary" onClick={onResetResults} className="rounded-2xl bg-emerald-950/20 text-white hover:bg-emerald-950/30">
                <LuRotateCcw className="mr-2 h-4 w-4" />
                Ergebnisse leeren
              </Button>
              <Button variant="outline" onClick={onClearAll} className="rounded-2xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                Alles leeren
              </Button>
              {onLogout && (
                <Button variant="outline" onClick={onLogout} className="rounded-2xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <LuLogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              )}
            </>
          ) : (
            <>
              {onRefresh && (
                <Button onClick={onRefresh} className="w-full rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 sm:w-auto">
                  <LuRefreshCw className="mr-2 h-4 w-4" />
                  Aktualisieren
                </Button>
              )}
              {onOpenAdmin && (
                <Button variant="secondary" onClick={onOpenAdmin} className="w-full rounded-2xl bg-emerald-950/20 text-white hover:bg-emerald-950/30 sm:w-auto">
                  Admin-Modus
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
