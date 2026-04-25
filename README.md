# Tennis Court - Vierer-Kombinationen

Tennis doubles tournament planner with rotating partners, court assignment, bench rotation, live leaderboard, admin editing, and public live view.

## Quick start

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run type-check` | TypeScript check |
| `npm run lint` | ESLint (zero warnings) |
| `npm test` | Vitest unit tests |
| `npm run storybook` | Component explorer |

## Tech stack

Vite, React 19, TypeScript 6, Tailwind CSS v4, shadcn/ui, Vitest, Storybook, PHP, MySQL.

## Webspace deployment

The production build includes the PHP API from `public/api` and an Apache rewrite file from `public/.htaccess`.

1. Build the app with `npm run build`.
2. Upload the contents of `dist` to the webspace.
3. Copy `dist/api/config.example.php` to `dist/api/config.php` on the server.
4. Enter the MySQL DSN, database user, database password, admin username, and password hash in `config.php`.

Routes:

- `/view/clubabend` shows the public live view.
- `/admin/clubabend` opens the admin login and editor.
- `/api/public/get-tournament.php?slug=clubabend` returns public tournament data.
