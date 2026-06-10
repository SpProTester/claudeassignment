---
description: Generate k6 performance/load tests for an API endpoint
---

The user wants k6 performance tests for an endpoint in this project.

Project performance targets from `testing/README.md`:
- Job search: 100 VUs, < 500ms p95
- Login: 50 VUs, < 500ms p95
- Job detail: 200 VUs, < 300ms p95

API base URL: `http://localhost:5000/api`

Generate a k6 script that includes:

1. **Smoke test** — 1 VU, 1 minute (verify the script works)
2. **Load test** — ramp up to target VUs over 1 min, hold 3 min, ramp down
3. **Stress test** — ramp beyond target to find the breaking point

**k6 code rules:**
- Use ES module imports: `import http from 'k6/http'`, `import { check, sleep } from 'k6'`
- Export `options` with `scenarios` or `stages` for the load profile
- Export `thresholds` for p95 response time and error rate (< 1%)
- Use `check(res, { 'status is 200': (r) => r.status === 200, 'response time OK': (r) => r.timings.duration < 500 })`
- For authenticated endpoints: get token in `setup()` function and pass to default function
- Add `sleep(1)` between iterations to simulate real user think time
- Tag requests with `{ tags: { name: 'endpoint-name' } }` for clean reports

Output file path: `testing/performance/<endpoint-name>.js`

After the code, add a **Run Commands** section:
```bash
k6 run testing/performance/<file>.js              # smoke
k6 run --env SCENARIO=load testing/performance/<file>.js   # load
```
