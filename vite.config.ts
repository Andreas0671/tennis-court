/// <reference types="vitest/config" />
import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const devStorePath = path.resolve(__dirname, ".tools/dev-tournaments.json");

function readJsonBody(req: import("node:http").IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += String(chunk);
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : null);
      } catch {
        resolve(null);
      }
    });
  });
}

function sendJson(res: import("node:http").ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function loadDevStore(): Record<string, unknown> {
  if (!fs.existsSync(devStorePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(devStorePath, "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function saveDevStore(store: Record<string, unknown>) {
  fs.mkdirSync(path.dirname(devStorePath), { recursive: true });
  fs.writeFileSync(devStorePath, JSON.stringify(store, null, 2));
}

function devApiPlugin(): Plugin {
  return {
    name: "local-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          next();
          return;
        }

        const requestUrl = new URL(req.url, "http://127.0.0.1");
        const store = loadDevStore();

        if (requestUrl.pathname === "/api/admin/check-session.php") {
          sendJson(res, 200, { authenticated: true, username: "Andreas" });
          return;
        }

        if (requestUrl.pathname === "/api/admin/login.php") {
          sendJson(res, 200, { username: "Andreas" });
          return;
        }

        if (requestUrl.pathname === "/api/admin/logout.php") {
          sendJson(res, 200, { ok: true });
          return;
        }

        if (
          requestUrl.pathname === "/api/admin/get-tournament.php" ||
          requestUrl.pathname === "/api/public/get-tournament.php"
        ) {
          const slug = requestUrl.searchParams.get("slug") || "clubabend";
          const tournament = store[slug];
          if (!tournament) {
            sendJson(res, 404, { error: "Turnier nicht gefunden." });
            return;
          }
          sendJson(res, 200, tournament);
          return;
        }

        if (requestUrl.pathname === "/api/admin/save-tournament.php") {
          const body = await readJsonBody(req);
          if (!body || typeof body !== "object") {
            sendJson(res, 400, { error: "Ungueltige JSON-Anfrage." });
            return;
          }

          const payload = body as { slug?: string; title?: string; state?: unknown };
          const slug = payload.slug || "clubabend";
          const tournament = {
            slug,
            title: payload.title || "TC Heide 1975",
            updatedAt: new Date().toISOString(),
            state: payload.state,
          };
          store[slug] = tournament;
          saveDevStore(store);
          sendJson(res, 200, tournament);
          return;
        }

        sendJson(res, 404, { error: "API-Endpunkt nicht gefunden." });
      });
    },
  };
}

export default defineConfig({
  plugins: [devApiPlugin(), tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
    exclude: ["**/*.stories.*", "**/node_modules/**"],
  },
});
