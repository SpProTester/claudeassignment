# Chat — Jira Notes

---

## Epic: JP-CHAT — Real-Time Messaging

**Priority:** Low | **Status:** Planned (Phase 8)

---

## Stories

### JP-CHAT-001: Conversation Creation & Management
**Points:** 3 | **Status:** Planned

### JP-CHAT-002: Real-Time Message Delivery
**Points:** 5 | **Status:** Planned

### JP-CHAT-003: Message History & Pagination
**Points:** 3 | **Status:** Planned

### JP-CHAT-004: Read Receipts & Typing Indicators
**Points:** 3 | **Status:** Planned

### JP-CHAT-005: Chat Notifications
**Points:** 2 | **Status:** Planned

---

## Decisions

- Chat is **linked to applications** (not open DMs) to reduce spam and maintain context
- **Socket.IO** reused from notifications module — same server, different namespace `/chat`
- For multi-instance production: add `@socket.io/redis-adapter` (same requirement as notifications)
- **No message editing or deletion** in MVP to simplify audit trail

## Dependencies

- Requires: Notifications module (for offline message notifications)
- Requires: Socket.IO infrastructure already in place (done in Phase 5)
