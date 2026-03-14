/**
 * index.ts — Entry point for the insight school communication hub.
 *
 * This file is a minimal smoke-test for the classification pipeline.
 * Replace with your chosen server/framework entrypoint as the team builds out
 * the dashboard layer.
 */

import { loadConfig } from "./config.js";
import { SchoolMessageClassifier } from "./classifier.js";
import type { SchoolMessage } from "./types.js";

// ─── Sample school messages (smoke-test dataset) ─────────────────────────────

const sampleMessages: SchoolMessage[] = [
  {
    id: "msg-001",
    channel: "email",
    subject: "URGENT: School closed tomorrow due to heating failure",
    body: "Dear parents and teachers, due to a heating system failure, school will be closed on Friday March 14. All classes are cancelled. Students should stay home.",
    sender: "secretariat@school.de",
    timestamp: "2026-03-13T08:00:00Z",
  },
  {
    id: "msg-002",
    channel: "form",
    subject: "Permission slip: Class trip to science museum (March 20)",
    body: "Please sign and return the attached permission slip by March 18 to allow your child to participate in the class trip to the Heilbronn Science Museum. Cost: €5.",
    sender: "teacher.mueller@school.de",
    timestamp: "2026-03-13T09:30:00Z",
  },
  {
    id: "msg-003",
    channel: "information_sheet",
    subject: "Spring term newsletter — school events overview",
    body: "Welcome to the spring term! This newsletter contains an overview of upcoming events, holiday dates, and extracurricular activities for the coming months.",
    sender: "principal@school.de",
    timestamp: "2026-03-13T10:00:00Z",
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("insight — School Communication Hub");
  console.log("Team 7 | Challenge 2: Clean Communication\n");

  const config = loadConfig();
  const classifier = new SchoolMessageClassifier(config.geminiApiKey);

  for (const message of sampleMessages) {
    console.log(`─── Classifying: [${message.id}] ${message.subject}`);
    try {
      const classification = await classifier.classify(message);
      console.log(`  type:     ${classification.type}`);
      console.log(`  audience: ${classification.audience.join(", ")}`);
      console.log(`  priority: ${classification.priority}`);
      console.log(`  summary:  ${classification.summary}`);
      if (classification.actionItems && classification.actionItems.length > 0) {
        console.log(`  actions:  ${classification.actionItems.join(" | ")}`);
      }
    } catch (err) {
      console.error(`  ERROR: ${err instanceof Error ? err.message : String(err)}`);
    }
    console.log();
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
