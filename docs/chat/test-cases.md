# Chat — Test Cases

**Status:** Planned (Phase 8). Test cases are designed ahead of implementation.

---

## Socket.IO Tests

```javascript
it('delivers message to both participants in real-time', (done) => {
  const employer = io(SERVER_URL + '/chat', { auth: { token: employerToken } });
  const seeker = io(SERVER_URL + '/chat', { auth: { token: seekerToken } });

  seeker.on('message:new', (msg) => {
    expect(msg.content).toBe('Interview scheduled for Monday');
    expect(msg.sender_id).toBe(employerId);
    done();
  });

  employer.on('connect', () => {
    employer.emit('message:send', {
      conversation_id: convId,
      content: 'Interview scheduled for Monday'
    });
  });
});

it('does not deliver message to non-participant', (done) => {
  const outsider = io(SERVER_URL + '/chat', { auth: { token: outsiderToken } });
  const messageReceived = jest.fn();
  outsider.on('message:new', messageReceived);

  employer.emit('message:send', { conversation_id: convId, content: 'Private message' });

  setTimeout(() => {
    expect(messageReceived).not.toHaveBeenCalled();
    done();
  }, 500);
});
```

---

## Integration Tests

```javascript
it('POST /api/chats creates conversation for valid application', async () => {
  const res = await employerAgent.post('/api/chats').send({ application_id: app.id });
  expect(res.status).toBe(201);
  expect(res.body.data.conversation.employer_id).toBe(employer.id);
});

it('returns 403 for seeker initiating chat', async () => {
  const res = await seekerAgent.post('/api/chats').send({ application_id: app.id });
  expect(res.status).toBe(403);
});

it('GET /api/chats/:id/messages returns history', async () => {
  await seedMessages(conv.id, 5);
  const res = await employerAgent.get(`/api/chats/${conv.id}/messages`);
  expect(res.body.data.messages).toHaveLength(5);
});
```

---

## Security Tests

- XSS: Send message with `<script>alert(1)</script>` → stored as sanitized plain text
- Authorization: User B cannot read User A's conversation (403)
- Socket auth: Unauthenticated socket connection rejected
