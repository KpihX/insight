const now = new Date();
const runId = now.toISOString().replace(/[-:.TZ]/g, '');

return [
  {
    json: {
      subject: "Parent meeting scheduled for Tim Doe on Tuesday, March 17 at 4:00 PM",
      from: {
        value: [
          {
            address: "kapoivha@gmail.com",
            name: "David Brown",
          },
        ],
        text: "David Brown <kapoivha@gmail.com>",
        html: "<span class=\"peer\">David Brown &lt;<a href=\"mailto:kapoivha@gmail.com\">kapoivha@gmail.com</a>&gt;</span>",
      },
      to: {
        value: [
          {
            address: "nextgenproject373@gmail.com",
            name: "Sarah Lee",
          },
        ],
        text: "Sarah Lee <nextgenproject373@gmail.com>",
        html: "<span class=\"peer\">Sarah Lee &lt;<a href=\"mailto:nextgenproject373@gmail.com\">nextgenproject373@gmail.com</a>&gt;</span>",
      },
      cc: {
        value: [
          {
            address: "jane.doe@example.com",
            name: "Jane Doe",
          },
        ],
        text: "Jane Doe <jane.doe@example.com>",
        html: "<span class=\"peer\">Jane Doe &lt;<a href=\"mailto:jane.doe@example.com\">jane.doe@example.com</a>&gt;</span>",
      },
      date: now.toISOString(),
      text: "Hello Sarah, Jane Doe has asked for a parent meeting regarding Tim Doe. I have scheduled it for Tuesday, March 17, 2026 from 4:00 PM to 5:00 PM in Guidance Room B12. Please keep that slot available and bring Tim Doe's attendance notes.",
      html: "<body><p>Hello Sarah, Jane Doe has asked for a parent meeting regarding Tim Doe.</p><p>I have scheduled it for Tuesday, March 17, 2026 from 4:00 PM to 5:00 PM in Guidance Room B12.</p><p>Please keep that slot available and bring Tim Doe's attendance notes.</p></body>",
      messageId: `<DEMO-EMAIL-STAFF1-MEETING-${runId}@mail.example.com>`,
      headerLines: [
        { key: "mime-version", line: "MIME-Version: 1.0" },
        { key: "content-type", line: "Content-Type: text/html; charset=UTF-8" },
      ],
    },
  },
];
