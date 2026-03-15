const now = new Date();
const unixSeconds = Math.floor(now.getTime() / 1000);
const runId = `${unixSeconds}`;

return [
  {
    json: {
      source: "whatsapp",
      messageId: `DEMO-WA-TIM-ABSENCE-${runId}`,
      from: "+15559876543",
      fromName: "Jane Doe",
      groupId: null,
      remoteJid: "teachers",
      body: "Hello, this is Jane Doe. Tim Doe will be absent today because he has a fever. Thank you.",
      timestamp: unixSeconds,
      type: "text",
    },
  },
];
