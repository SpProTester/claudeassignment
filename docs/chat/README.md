# Chat Module

> Real-time messaging between employers and seekers via Socket.IO.

---

## Overview

The Chat module enables direct communication between employers and job seekers, facilitating interview scheduling, questions, and offer discussions — all within the platform.

**Scope:**
- 1-to-1 chat between employer and seeker (linked to a specific job application)
- Real-time message delivery via Socket.IO
- Message history persistence in PostgreSQL
- Read receipts (seen/delivered indicators)
- Unread message count in navigation
- Message notifications (in-app + email)

**Status:** Planned (Phase 8)

**Out of scope:** Group chats, video calls, file attachments in messages (all future).

---

## Architecture Decision

Chat uses Socket.IO (already installed for notifications) with a separate `chat` namespace. Messages are persisted to PostgreSQL to ensure history survives server restarts and is searchable.

```
Client A ──→ Socket.IO ──→ Server ──→ DB (persist)
                                  └──→ Socket.IO ──→ Client B
```

---

## Related Docs

- [Requirements](requirements.md)
- [API Reference](api.md)
- [Database Schema](database-schema.md)
- [Frontend Flow](frontend-flow.md)
- [Backend Flow](backend-flow.md)
- [Test Cases](test-cases.md)
- [Jira Notes](jira-notes.md)
