const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const USE_REAL_API = parseBoolean(import.meta.env.VITE_USE_REAL_API, true);
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://nextgen-n8n.westeurope.cloudapp.azure.com/webhook';
export const DEFAULT_DASHBOARD_ROLE = import.meta.env.VITE_DASHBOARD_ROLE ?? 'teacher';
export const DEFAULT_DASHBOARD_STAFF_ID = import.meta.env.VITE_DASHBOARD_STAFF_ID ?? 'staff_1';
export const REFRESH_INTERVAL_MS = parseNumber(import.meta.env.VITE_REFRESH_INTERVAL_MS, 15000);
export const DEMO_CALENDAR_WEEK_START =
  import.meta.env.VITE_DEMO_CALENDAR_WEEK_START ?? '2026-03-16';
