return [
  {
    json: {
      subject: "Absence notice for Tim Doe",
      from: {
        value: [
          {
            address: "jane.doe@example.com",
            name: "Jane Doe",
          },
        ],
        text: "Jane Doe <jane.doe@example.com>",
        html: "<span class=\"peer\">Jane Doe &lt;<a href=\"mailto:jane.doe@example.com\">jane.doe@example.com</a>&gt;</span>",
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
      date: "2026-03-14T07:15:00Z",
      text: "Hello, Jane Doe here. Tim Doe will be absent today because he has a fever.",
      html: "<body><p>Hello, Jane Doe here. Tim Doe will be absent today because he has a fever.</p></body>",
      messageId: "<SEED-EVENT-0001@mail.example.com>",
      headerLines: [
        { key: "mime-version", line: "MIME-Version: 1.0" },
        { key: "content-type", line: "Content-Type: text/html; charset=UTF-8" },
      ],
    },
  },
];
