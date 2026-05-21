# Projektkontext

Dieses Projekt ist eine Vite/React-App fuer Tennis-Doppelturniere bzw. Vierer-Kombinationen.

## Zweck

Die App plant Tennis-Doppelrunden mit wechselnden Partnern, Platzzuweisung, Bankrotation, Live-Rangliste, Admin-Bearbeitung und oeffentlicher Zuschaueransicht.

## Wichtige Routen

- `/view/clubabend`: oeffentliche Live-Ansicht
- `/admin/clubabend`: Admin-Login und Turniereditor
- `/api/public/get-tournament.php?slug=clubabend`: oeffentliche Turnierdaten

## Tech Stack

- Vite
- React 19
- TypeScript 6
- Tailwind CSS v4
- shadcn/ui-artige Komponenten
- Vitest
- Storybook
- PHP-API unter `public/api`
- MySQL auf dem Webspace

## Wichtige Dateien und Ordner

- `src/App.tsx`: Routing, Admin-/Viewer-Modus, Login, Laden und Speichern des Turniers
- `src/hooks/useTournament.ts`: zentrale Turnierlogik im React-State
- `src/lib/tournament.ts`: Turniergenerierung und Kernlogik
- `src/lib/leaderboard.ts`: Ranglistenberechnung
- `src/lib/resultParser.ts`: Ergebnisparser
- `src/lib/tournamentApi.ts`: Kommunikation mit der PHP-API
- `src/lib/tournamentStorage.ts`: Default-State und Persistenz-Helfer
- `src/components`: UI-Komponenten fuer Setup, Runden, Matches, Rangliste, Spieler usw.
- `public/api`: PHP-Endpunkte fuer Admin und Public View
- `public/.htaccess`: Apache-Rewrite-Regeln fuer Webspace-Routing
- `dist`: gebautes Upload-Paket

## Lokale Befehle

```bash
npm install
npm run dev
npm run build
npm run type-check
npm run lint
npm test
npm run storybook
```

## Deployment auf Webspace

1. `npm run build` ausfuehren.
2. Inhalt von `dist` auf den Webspace hochladen.
3. Auf dem Server `dist/api/config.example.php` nach `dist/api/config.php` kopieren.
4. In `config.php` MySQL-DSN, Datenbanknutzer, Datenbankpasswort, Admin-Benutzer und Passwort-Hash eintragen.

## Aktueller Stand

Der Workspace wurde am 2026-04-27 nach `C:\Users\Andreas\OneDrive\Dokumente\New project 2` kopiert. Diese Datei dient als Startpunkt, falls im neuen Projekt oder in einem neuen Chat weitergearbeitet wird.

## Hinweise fuer die Weiterarbeit

- Vor groesseren Aenderungen zuerst `npm run type-check`, `npm run lint` und `npm test` nutzen, sofern die Umgebung bereit ist.
- Die App hat sowohl eine lokale React-Seite als auch Webspace-spezifische PHP-Dateien. Aenderungen an API-Verhalten sollten deshalb Frontend und `public/api` zusammen betrachten.
- Upload-ZIP-Dateien im Projektordner dokumentieren verschiedene bisherige Webspace-Staende.
