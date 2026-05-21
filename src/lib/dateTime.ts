const BERLIN_TIME_ZONE = "Europe/Berlin";

function parseTimestamp(value: string): Date {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const hasTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(normalized);
  return new Date(hasTimeZone ? normalized : `${normalized}Z`);
}

export function formatUpdatedAt(value: string | null): string {
  if (!value) return "noch nicht gespeichert";

  const date = parseTimestamp(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: BERLIN_TIME_ZONE,
  }).format(date);
}
