# Chat — Backend Flow

**Status:** Planned (Phase 8)

---

## Socket.IO Message Flow

```
Client emits: message:send { conversation_id, content }
  │
  ├─ Validate: socket.userId is a participant of conversation_id
  ├─ Sanitize: strip HTML from content (use DOMPurify/sanitize-html)
  ├─ Persist: Message.create({ conversation_id, sender_id: socket.userId, content })
  ├─ Update: Conversation.update({ last_message_at: now })
  ├─ Emit: to each participant's room → message:new (message object)
  └─ If other user is offline:
        Notification.create({ type: 'NEW_MESSAGE', user_id: other_user_id, ... })
```

---

## REST: Get Message History

```
GET /api/chats/:conversationId/messages
  │
  ├─ Verify: req.user.userId is employer_id or seeker_id of conversation
  ├─ Message.findAll({
  │     where: { conversation_id },
  │     order: [['created_at', 'DESC']],
  │     limit, offset
  │   })
  └─ Return paginated messages
```

---

## Room Strategy

Each conversation has a Socket.IO room: `chat:${conversationId}`

Both participants join on socket connect by fetching their conversation IDs:
```javascript
const convIds = await Conversation.findAll({ where: { [Op.or]: [{ employer_id }, { seeker_id }] } });
convIds.forEach(c => socket.join(`chat:${c.id}`));
```

This ensures messages are only broadcast to the two participants.
