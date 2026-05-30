# Analytics — Frontend Flow

---

## Employer Dashboard Analytics

```
/employer/dashboard
  ↓
EmployerDashboard.jsx:
  ├─ Stats row:
  │   ├─ StatsCard: Active Jobs (5)
  │   ├─ StatsCard: Total Applications (284)
  │   ├─ StatsCard: Pending Review (42)
  │   └─ StatsCard: Positions Hired (3)
  ├─ Applications trend sparkline (last 7 days)
  └─ Recent applications table
```

## Per-Job Stats

```
/employer/jobs/:id/stats
  ↓
JobStats.jsx (or modal panel):
  ├─ Summary cards: Views | Applications | View-to-Apply rate
  ├─ Line chart: Daily views vs applications (last 30 days)
  │   Using: recharts LineChart or Chart.js
  └─ Donut chart: Applications by ATS stage
       Applied(10) | Reviewing(5) | Interview(3) | Offer(1) | Hired(0) | Rejected(4)
```

## Admin Analytics Dashboard (Planned)

```
/admin/analytics
  ↓
AdminAnalytics.jsx:
  ├─ KPI cards: Total Users | Active Jobs | Applications Today | MRR
  ├─ Line chart: User registrations last 30 days
  ├─ Bar chart: Applications per day last 30 days
  ├─ Table: Top 10 searched keywords
  └─ Table: Top 10 categories by job count
```

## Chart Library

Using `recharts` (already common in React ecosystems, lightweight):
```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
```
