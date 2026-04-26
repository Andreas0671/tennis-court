import { createDefaultTournamentState } from "@/lib/tournamentStorage";
import type { SavedTournament, TournamentFormState } from "@/types";

export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    ...init,
  });
  const text = await response.text();
  let data: unknown;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    if (!response.ok) {
      throw new ApiError(text || "Serverantwort war kein gueltiges JSON.", response.status);
    }
    throw new ApiError("Serverantwort war kein gueltiges JSON.", response.status);
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "Unbekannter Serverfehler";
    throw new ApiError(message, response.status);
  }

  return data as T;
}

function normalizeTournament(tournament: SavedTournament): SavedTournament {
  return {
    ...tournament,
    updatedAt: tournament.updatedAt ?? null,
    state: {
      ...createDefaultTournamentState(),
      ...tournament.state,
    },
  };
}

export function getPublicTournament(slug: string): Promise<SavedTournament> {
  return apiFetch<SavedTournament>(`/api/public/get-tournament.php?slug=${encodeURIComponent(slug)}`).then(normalizeTournament);
}

export function getAdminTournament(slug: string): Promise<SavedTournament> {
  return apiFetch<SavedTournament>(`/api/admin/get-tournament.php?slug=${encodeURIComponent(slug)}`).then(normalizeTournament);
}

export function checkSession(): Promise<{ authenticated: boolean; username: string | null }> {
  return apiFetch("/api/admin/check-session.php");
}

export function login(username: string, password: string): Promise<{ username: string }> {
  return apiFetch("/api/admin/login.php", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return apiFetch("/api/admin/logout.php", { method: "POST" });
}

export function saveTournament(payload: { slug: string; title: string; state: TournamentFormState }): Promise<SavedTournament> {
  return apiFetch<SavedTournament>("/api/admin/save-tournament.php", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(normalizeTournament);
}
