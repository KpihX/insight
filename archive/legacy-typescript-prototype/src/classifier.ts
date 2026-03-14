/**
 * classifier.ts — AI classification pipeline (Gemini 2.5 Flash).
 *
 * Responsibility: take a raw SchoolMessage and return a Classification.
 * Uses a structured prompt that enforces the school domain taxonomy.
 *
 * Design principle: zero magic — the prompt is explicit, the output is parsed
 * strictly, and fallbacks are surfaced as errors, not silent defaults.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { settings } from "./config.js";
import type {
  SchoolMessage,
  Classification,
  MessageType,
  Audience,
  Priority,
} from "./types.js";

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildClassificationPrompt(message: SchoolMessage): string {
  return `You are a school communication classifier for a dashboard used by teachers, parents, students, and secretariat.

Classify the following school communication message and respond ONLY with valid JSON matching the schema below.

MESSAGE:
Channel: ${message.channel}
Subject: ${message.subject}
Body: ${message.body}
Sender: ${message.sender}

SCHEMA (respond with exactly this structure, no extra fields):
{
  "type": "<one of: urgent | informational | action_required | event>",
  "audience": ["<one or more of: student | parent | teacher | secretariat | all>"],
  "priority": "<one of: high | medium | low>",
  "summary": "<one sentence summary>",
  "actionItems": ["<action item if type is action_required, else empty array>"]
}

RULES:
- "urgent": requires immediate attention (emergency, safety, critical deadline within 24h)
- "informational": general info, no action needed
- "action_required": recipient must do something (sign form, register, reply)
- "event": calendar event, trip, school ceremony, deadline
- "audience": who needs to see this (can be multiple roles)
- "priority": high = same-day action, medium = within week, low = FYI

Respond only with the JSON object. No markdown, no explanation.`;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseClassification(raw: string): Classification {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    throw new Error(`Gemini returned non-JSON: ${raw}`);
  }

  const p = parsed as Record<string, unknown>;

  const validTypes: MessageType[] = ["urgent", "informational", "action_required", "event"];
  const validAudiences: Audience[] = ["student", "parent", "teacher", "secretariat", "all"];
  const validPriorities: Priority[] = ["high", "medium", "low"];

  const type = p["type"] as MessageType;
  const audience = p["audience"] as Audience[];
  const priority = p["priority"] as Priority;
  const summary = p["summary"] as string;
  const actionItems = (p["actionItems"] as string[] | undefined) ?? [];

  if (!validTypes.includes(type)) throw new Error(`Invalid type: ${type}`);
  if (!Array.isArray(audience) || audience.some((a) => !validAudiences.includes(a)))
    throw new Error(`Invalid audience: ${JSON.stringify(audience)}`);
  if (!validPriorities.includes(priority)) throw new Error(`Invalid priority: ${priority}`);
  if (typeof summary !== "string") throw new Error("Missing summary");

  return { type, audience, priority, summary, actionItems };
}

// ─── Classifier ───────────────────────────────────────────────────────────────

export class SchoolMessageClassifier {
  private readonly genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async classify(message: SchoolMessage): Promise<Classification> {
    const model = this.genAI.getGenerativeModel({
      model: settings.gemini.model,
      generationConfig: {
        maxOutputTokens: settings.gemini.maxOutputTokens,
        temperature: settings.gemini.temperature,
      },
    });

    const prompt = buildClassificationPrompt(message);
    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    return parseClassification(raw);
  }

  async classifyBatch(messages: SchoolMessage[]): Promise<Classification[]> {
    // Sequential to avoid rate-limit issues in hackathon context
    const results: Classification[] = [];
    for (const msg of messages) {
      results.push(await this.classify(msg));
    }
    return results;
  }
}
