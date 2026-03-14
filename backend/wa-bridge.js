/**
 * wa-bridge.js — WhatsApp → n8n bridge
 *
 * URL resolution (single source of truth = .env.n8n):
 *   N8N_TARGET=cloud|local|tailnet selects the base URL
 *   WEBHOOK_URL_* values define the target endpoints
 *   N8N_WA_MODE=test|production selects /webhook-test/wa-event vs /webhook/wa-event
 *   WEBHOOK_URL remains the compatibility fallback
 *   Override with N8N_WA_WEBHOOK env var if needed.
 *
 * Usage:
 *   node wa-bridge.js
 */

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import { config } from 'dotenv';

// ── Load .env.n8n (single source of truth for n8n URL) ───────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dir, '.env.n8n') });

function buildN8nUrl() {
  // Explicit override always wins
  if (process.env.N8N_WA_WEBHOOK) return process.env.N8N_WA_WEBHOOK;

  const target = (process.env.N8N_TARGET ?? 'cloud').toLowerCase();
  const candidates = {
    cloud: process.env.WEBHOOK_URL_CLOUD,
    local: process.env.WEBHOOK_URL_LOCAL,
    tailnet: process.env.WEBHOOK_URL_TAILNET,
  };

  // Derive from .env.n8n using the selected target, then fall back to legacy WEBHOOK_URL.
  let base = candidates[target] ?? process.env.WEBHOOK_URL ?? 'http://localhost:5678/';
  // Add protocol if missing
  if (!base.startsWith('http')) base = `http://${base}`;
  // Ensure trailing slash removed before appending path
  const mode = (process.env.N8N_WA_MODE ?? 'production').toLowerCase();
  const path = mode === 'test' ? '/webhook-test/wa-event' : '/webhook/wa-event';
  return base.replace(/\/$/, '') + path;
}

const N8N_URL  = buildN8nUrl();
const AUTH_DIR = resolve(process.env.WA_AUTH_PATH ?? './wa-auth');
const WA_PHONE = process.env.WA_PHONE; // e.g. "33605957785" — set to skip prompt

let reconnectDelay = 1000;
let pairingRequested = false; // guard: request pairing code only once

function ask(question) {
  // Pause Baileys logs during input to avoid doubled chars
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  return new Promise(res => rl.question(question, ans => { rl.close(); res(ans.trim()); }));
}

async function start() {
  console.log(`[wa-bridge] auth dir : ${AUTH_DIR}`);
  console.log(`[wa-bridge] n8n url  : ${N8N_URL}`);

  // Fetch latest WA Web version — fixes 405 "version rejected" errors
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`[wa-bridge] WA version: ${version.join('.')} (latest: ${isLatest})`);

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    version,
    auth:    state,
    browser: ['Ubuntu', 'Chrome', '22.04'],
    // Suppress verbose Baileys logs during pairing
    logger:  (await import('pino')).default({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  // ── Pairing code — called ONCE right after socket creation ───
  if (!sock.authState.creds.registered && !pairingRequested) {
    pairingRequested = true;
    const phone = WA_PHONE ?? await ask('\n[wa-bridge] Phone number (no + or spaces, e.g. 33605957785): ');
    try {
      const code = await sock.requestPairingCode(phone.replace(/\D/g, ''));
      const fmt  = code.match(/.{1,4}/g)?.join('-') ?? code;
      console.log(`\n[wa-bridge] ┌──────────────────────────────────┐`);
      console.log(`[wa-bridge] │  Pairing code :   ${fmt.padEnd(9)}        │`);
      console.log(`[wa-bridge] └──────────────────────────────────┘`);
      console.log(`[wa-bridge] → Phone: WhatsApp → Linked Devices → Link with phone number → enter code\n`);
    } catch (e) {
      console.error(`[wa-bridge] requestPairingCode failed: ${e.message}`);
    }
  }

  // ── Connection lifecycle ──────────────────────────────────────
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {

    if (connection === 'open') {
      reconnectDelay = 1000;
      pairingRequested = false;
      console.log(`[wa-bridge] ✓ connected — forwarding to ${N8N_URL}`);
    }

    if (connection === 'close') {
      const code    = /** @type {Boom} */ (lastDisconnect?.error)?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;

      if (loggedOut) {
        console.log('[wa-bridge] ✗ logged out — delete ./wa-auth and restart');
        process.exit(1);
      }

      console.log(`[wa-bridge] disconnected (code=${code}) — retry in ${reconnectDelay}ms`);
      setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
        start();
      }, reconnectDelay);
    }
  });

  // ── Incoming messages ─────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return; // skip history sync bursts

    for (const msg of messages) {
      if (msg.key.fromMe) continue; // ignore own messages

      // Extract plain text only (skip media, stickers, etc.)
      const body =
        msg.message?.conversation ??
        msg.message?.extendedTextMessage?.text ??
        null;
      if (!body) continue;

      const isGroup = msg.key.remoteJid?.includes('@g.us') ?? false;

      const payload = {
        source:    'whatsapp',
        messageId: msg.key.id,
        from:      msg.key.remoteJid?.replace(/@s\.whatsapp\.net|@g\.us/, '') ?? '',
        fromName:  msg.pushName ?? 'Unknown',
        groupId:   isGroup ? msg.key.remoteJid : null,
        body,
        timestamp: Number(msg.messageTimestamp), // Unix seconds
        type:      'text',
      };

      try {
        const res = await fetch(N8N_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });
        console.log(`[wa-bridge] ✓ forwarded msg → HTTP ${res.status}`);
      } catch (err) {
        console.error(`[wa-bridge] ✗ forward failed:`, err.message);
      }
    }
  });
}

start();
