# Chat — Frontend Flow

**Status:** Planned (Phase 8)

---

## Chat UI Layout

```
/seeker/messages  (seeker)
/employer/messages (employer)
  └─ MessagesLayout
       ├─ Left panel: Conversation list (sorted by last_message_at)
       └─ Right panel: Active conversation
            ├─ Message history (scrollable, loads older on scroll-up)
            ├─ Typing indicator ("Jane is typing...")
            └─ Message input + Send button
```

## Conversation Flow

```
Employer clicks "Message Applicant" on ATS board
  ↓
POST /api/chats { application_id }
  ↓
Redirect to /employer/messages/:conversationId
  ↓
Load history: GET /api/chats/:id/messages
  ↓
Type message → typing:start event
Send → socket.emit('message:send', { conversation_id, content })
  ↓
Server persists message → emits message:new to both participants
  ↓
Own message appears in chat (optimistic update)
Other user's chat updates in real-time
```

## Unread Badge

```
Navigation bar shows message icon with unread count
  ↓
On socket connect: server emits { unread_messages: N }
On new message received (not in that conversation): increment badge
On conversation opened: badge decrements, emit message:read
```
