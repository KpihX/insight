return [
  {
    json: {
      subject: "Mandatory administrative meeting on Monday, March 16 at 2:00 PM",
      from: {
        value: [
          {
            address: "david.brown@example.com",
            name: "David Brown",
          },
        ],
        text: "David Brown <david.brown@example.com>",
        html: "<span class=\"peer\">David Brown &lt;<a href=\"mailto:david.brown@example.com\">david.brown@example.com</a>&gt;</span>",
      },
      to: {
        value: [
          {
            address: "sarah.lee@example.com",
            name: "Sarah Lee",
          },
        ],
        text: "Sarah Lee <sarah.lee@example.com>",
        html: "<span class=\"peer\">Sarah Lee &lt;<a href=\"mailto:sarah.lee@example.com\">sarah.lee@example.com</a>&gt;</span>",
      },
      cc: {
        value: [
          {
            address: "emily.carter@example.com",
            name: "Emily Carter",
          },
        ],
        text: "Emily Carter <emily.carter@example.com>",
        html: "<span class=\"peer\">Emily Carter &lt;<a href=\"mailto:emily.carter@example.com\">emily.carter@example.com</a>&gt;</span>",
      },
      date: "2026-03-14T11:30:00Z",
      text: "Hello Sarah, please attend a mandatory administrative meeting on Monday, March 16, 2026 from 2:00 PM to 3:00 PM in Room 204. We will review the teacher dashboard to-do workflow and the updated attendance escalation process. Please be on time.",
      html: "<body><p>Hello Sarah, please attend a mandatory administrative meeting on Monday, March 16, 2026 from 2:00 PM to 3:00 PM in Room 204.</p><p>We will review the teacher dashboard to-do workflow and the updated attendance escalation process. Please be on time.</p></body>",
      messageId: "<DEMO-EMAIL-STAFF1-MEETING@mail.example.com>",
      headerLines: [
        { key: "mime-version", line: "MIME-Version: 1.0" },
        { key: "content-type", line: "Content-Type: text/html; charset=UTF-8" },
      ],
    },
  },
];
