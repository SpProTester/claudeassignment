# Chat — Database Schema

**Status:** Designed, migration not yet created.

---

## Table: `conversations`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `application_id` | UUID | FK → applications(id), UNIQUE |
| `employer_id` | UUID | FK → users(id) |
| `seeker_id` | UUID | FK → users(id) |
| `last_message_at` | TIMESTAMPTZ | For sorting conversation list |
| `created_at` | TIMESTAMPTZ | |

**Constraints:** `UNIQUE(application_id)` — one conversation per application

---

## Table: `messages`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | PK |
| `conversation_id` | UUID | FK → conversations(id) |
| `sender_id` | UUID | FK → users(id) |
| `content` | TEXT | Plain text, XSS-sanitized |
| `is_read` | BOOLEAN | DEFAULT false |
| `read_at` | TIMESTAMPTZ | NULL |
| `created_at` | TIMESTAMPTZ | |

**Indexes:**
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(conversation_id, created_at DESC);
```

---

## Relationships

```
applications ──  conversations (1:1)
conversations ──< messages (1:N)
conversations → employer (FK → users)
conversations → seeker   (FK → users)
```
