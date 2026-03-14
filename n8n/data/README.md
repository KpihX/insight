# insight — Demo Data

> Lightweight demo datasets for seeding MongoDB and testing the pipeline.

---

## Structure

```text
n8n/data/
├── raw/
│   ├── contact_list.json
│   └── email_100_records.json
└── seed/
    ├── staff_directory.json
    └── family_directory.json
```

---

## Meaning

```text
raw/contact_list.json
- original mixed contact dataset from the team
- contains teacher, admin, and parent contacts

raw/email_100_records.json
- original fake email dataset
- useful for mailbox tests and synthetic event ingestion

seed/staff_directory.json
- cleaned Mongo-ready seed for staff_directory
- derived from raw/contact_list.json
- keeps only teacher and admin rows

seed/family_directory.json
- cleaned Mongo-ready seed for family_directory
- derived from raw/contact_list.json
- keeps only parent rows
```

---

## Demo Seeding Rule

```text
Use files in seed/ to populate MongoDB collections.
Use files in raw/ only as source material or future import inputs.
```
