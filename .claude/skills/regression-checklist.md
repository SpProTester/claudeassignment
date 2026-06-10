---
description: Generate a regression checklist for a feature or page before release
---

The user wants a regression checklist for a feature, module, or page in the Monster.com replica job portal.

Generate a markdown checklist that a QA engineer can tick off before releasing. Cover:

1. **Core functionality** — primary feature works end-to-end
2. **Auth & Authorization** — correct roles can access, wrong roles are blocked
3. **API contracts** — request/response shape is correct, status codes are right
4. **UI validation** — form validation messages, required fields, input limits
5. **Edge cases** — empty states, long strings, special characters, 0/max values
6. **Cross-browser** — Chrome, Firefox, Safari (flag items that need manual check)
7. **Responsive** — mobile (375px), tablet (768px), desktop (1280px)
8. **Error handling** — network errors, server errors show user-friendly messages
9. **Integration points** — related features that could be affected (list them)
10. **Performance** — page loads in reasonable time, no N+1 visible in network tab

Format as grouped markdown checklists with `- [ ]` items.

At the end, add a **Risk Areas** section flagging anything that commonly breaks or has known fragility in this project.
