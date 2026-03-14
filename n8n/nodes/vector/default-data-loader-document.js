const event = $input.first().json;

const text = [
  "School event",
  `Category: ${event.category ?? "general"}`,
  `Summary: ${event.summary ?? ""}`,
  `Content: ${event.content ?? ""}`,
  `Sender group: ${event.sender_group ?? "unknown"}`,
  `Sender: ${event.sender_name ?? "unknown"}`,
  `Source: ${event.source_system ?? "unknown"} / ${event.source_channel ?? "unknown"}`,
  `Receivers: ${(event.receivers ?? []).join(", ")}`,
  `Timestamp: ${event.timestamp ?? ""}`,
].join("\n");

return [
  {
    json: {
      pageContent: text,
      metadata: {
        event_id: event.original_id ?? event.id ?? null,
        sender_group: event.sender_group ?? null,
        category: event.category ?? null,
        source_system: event.source_system ?? null,
        source_channel: event.source_channel ?? null,
        urgent: Boolean(event.urgent),
        important: Boolean(event.important),
        action_required: Boolean(event.action_required),
        receivers: event.receivers ?? [],
        timestamp: event.timestamp ?? null,
      },
    },
  },
];
