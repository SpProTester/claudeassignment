# Chat — API Reference

**Status:** Planned (Phase 8). Endpoints below are designed, not yet implemented.

---

## REST Endpoints

### GET /api/chats

List all conversations for the current user.

**Auth:** Bearer

**Response 200:**
```json
{
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "application_id": "uuid",
        "other_user": { "id": "uuid", "full_name": "Jane Smith", "avatar_url": null },
        "job": { "title": "Senior React Developer" },
        "last_message": { "content": "We'd like to schedule an interview.", "created_at": "..." },
        "unread_count": 2
      }
    ]
  }
}
```

---

### GET /api/chats/:conversationId/messages

Load message history for a conversation.

**Auth:** Bearer (must be participant)

**Query:** `page`, `limit` (default 50, newest first)

**Response 200:**
```json
{
  "data": {
    "messages": [
      {
        "id": "uuid",
        "sender_id": "uuid",
        "content": "Hello, we'd like to discuss your application.",
        "is_read": true,
        "created_at": "2026-05-30T10:00:00.000Z"
      }
    ]
  }
}
```

---

### POST /api/chats

Start a new conversation (employer only).

**Auth:** Bearer (employer)

**Request Body:** `{ "application_id": "uuid" }`

**Response 201:** Created conversation.

---

## Socket.IO Events (Namespace: `/chat`)

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `message:send` | `{ conversation_id, content }` | Send a message |
| `message:read` | `{ conversation_id }` | Mark conversation as read |
| `typing:start` | `{ conversation_id }` | User started typing |
| `typing:stop` | `{ conversation_id }` | User stopped typing |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | Message object | New message received |
| `message:read` | `{ conversation_id, read_at }` | Other user read the conversation |
| `typing:indicator` | `{ conversation_id, user_id, is_typing }` | Typing state |
