---
description: Format a professional bug report from a short description
---

The user has described a bug. Generate a well-structured bug report using the format below.

Use the argument provided (the bug description) to fill in the details. Infer reasonable values for fields not explicitly mentioned. If this is a Monster.com replica project (job portal), reference relevant modules like Auth, Jobs, Applications, Profile, Resume, Employer Dashboard, Payments, etc.

Output the bug report in this exact format:

---

## Bug Report

**Title:** [Clear, concise title — Component: What went wrong]

**Environment:**
- Browser: [infer or state Unknown]
- OS: [infer or state Unknown]
- App: [client / client-admin / server]
- URL/Route: [relevant route if applicable]

**Severity:** [Critical / High / Medium / Low]
> Critical = app crash or data loss | High = major feature broken | Medium = partial feature broken | Low = cosmetic / minor

**Priority:** [P1 / P2 / P3 / P4]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Possible Cause:**
[Brief hypothesis — relevant file or component if known]

**Attachments / Notes:**
[Screenshots, console errors, network logs if mentioned]

---
