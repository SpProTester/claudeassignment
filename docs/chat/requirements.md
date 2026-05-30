# Chat — Requirements

---

## Functional Requirements

### FR-CHAT-001: Conversation Initiation
- Employer SHALL be able to initiate a chat with a seeker who has applied to one of their jobs
- Seeker SHALL be able to reply to messages from employers
- Chat SHALL be linked to a specific job application (not general platform DMs)

### FR-CHAT-002: Real-Time Messaging
- Messages SHALL be delivered in real-time via Socket.IO
- If the recipient is offline, message SHALL be stored and visible on next login
- System SHALL show typing indicators (`user:typing` event)

### FR-CHAT-003: Message Persistence
- All messages SHALL be stored in the database with sender, content, and timestamp
- Message history SHALL be available via REST API for initial page load

### FR-CHAT-004: Read Receipts
- System SHALL mark messages as read when the recipient views the conversation
- Unread message count SHALL appear in the navigation badge

### FR-CHAT-005: Notifications
- Recipient SHALL receive an in-app notification when a new message arrives (if not in the chat)
- A daily email digest SHALL be sent for unread messages (no instant email to prevent spam)

---

## Non-Functional Requirements

- Message delivery latency MUST be < 200ms for online recipients (same region)
- Chat history MUST support pagination (load older messages on scroll)
- Messages MUST be sanitized to prevent XSS (strip HTML, allow plain text only)

---

## Acceptance Criteria

- [ ] Employer starts chat with applicant → seeker sees message within 1 second
- [ ] Seeker replies → employer sees message within 1 second
- [ ] Page refresh → full message history loads from REST API
- [ ] Read receipt shown when recipient opens conversation
- [ ] Unread badge updates on new message
