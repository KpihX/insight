/**
 * config.ts — Configuration loader for the insight project.
 *
 * Loading order (KpihX config pattern adapted for TypeScript):
 *   1. process.env (injected by login shell via bw-env / zsh -l, or by Node itself)
 *   2. .env file in src/ (local dev override, never committed)
 *
 * Non-sensitive settings live directly in this file as typed constants.
 * Secrets are loaded exclusively from environment variables.
 */

import { config as loadDotenv } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env if present — local dev override (git-ignored)
loadDotenv({ path: join(__dirname, ".env") });

// ─── Non-sensitive settings ───────────────────────────────────────────────────

export const settings = {
  gemini: {
    model: "gemini-2.5-flash-preview-04-17",
    maxOutputTokens: 1024,
    temperature: 0.2, // low temperature for classification reliability
  },
  classification: {
    // Labels used in the classification prompt — keep in sync with types.ts
    types: ["urgent", "informational", "action_required", "event"] as const,
    audiences: ["student", "parent", "teacher", "secretariat", "all"] as const,
    priorities: ["high", "medium", "low"] as const,
  },
} as const;

// ─── Secrets ──────────────────────────────────────────────────────────────────

export interface Config {
  geminiApiKey: string;
}

export function loadConfig(): Config {
  const geminiApiKey = process.env.GEMINI_API_KEY ?? "";

  if (!geminiApiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set.\n" +
        "  → Add it to src/.env (local dev)\n" +
        "  → Or inject via: export GEMINI_API_KEY=... before running"
    );
  }

  return { geminiApiKey };
}
