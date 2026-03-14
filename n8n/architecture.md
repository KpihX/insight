# insight — n8n Architecture

## End-to-end view

```text
         email / WhatsApp / portal
                    |
                    v
         normalize-* Code nodes
                    |
                    v
      Load Staff + Load Family directories
                    |
                    v
         Merge Event + Context
                    |
                    v
             pre-classify
                    |
                    v
       Google Gemini (message a model)
                    |
                    v
        Parse Classified Event
            /              \
           v                v
   MongoDB school_events   Qdrant Vector Store
                                ^
                                |-- Embeddings Google Gemini
                                |-- Default Data Loader
```

## Published API branch

```text
school_events + staff_directory
    -> Read API
       -> /dashboard/brief
       -> /dashboard/feed
       -> /dashboard/event?id=...

school_events
    -> Action API
       -> /dashboard/action
```

## Demo preparation branch

```text
Demo Reset
  -> clear staff_directory / family_directory / school_events

Demo Seed
  -> seed staff_directory
  -> seed family_directory
  -> seed school_events
```

## Design principles

- n8n is the orchestration runtime, not a thin wrapper over another app server.
- MongoDB is the operational store.
- Qdrant is an optional future-facing semantic store.
- Demo helpers stay manual to avoid accidental writes during the hackathon.
- The public surface is intentionally small and explicit.
