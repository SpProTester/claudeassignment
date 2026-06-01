# Prompt 25 — Performance Optimization

## Phase
Phase 10 — Final Integration & Deployment

## Objective
Optimize the Job Portal for production performance with Redis caching, database query optimization, code splitting, virtualized lists, and bundle analysis.

---

## Prompt to Use

```
Optimize the Job Portal for production performance across backend and frontend.

BACKEND OPTIMIZATIONS:

1. Redis Caching with ioredis:
   npm install ioredis

   server/src/config/redis.js:
   - Initialize ioredis with REDIS_URL from env
   - In development: connect to local Redis (redis://localhost:6379)
   - Handle connection errors gracefully (log but don't crash server)
   - Export redis client
   
   server/src/utils/cache.js:
   - get(key) → redis.get(key), JSON.parse
   - set(key, value, ttlSeconds) → redis.setex(key, ttl, JSON.stringify(value))
   - del(key) → redis.del(key)
   - delPattern(pattern) → redis.keys(pattern) then del each
   - Use try/catch — if Redis is down, return null (graceful degradation)

   Apply caching in services:
   
   searchService.searchJobs:
   - Cache key: 'search:' + hash of query params (use crypto.createHash('md5'))
   - TTL: 300 seconds (5 minutes)
   - Skip cache for personalized results (when userId is in params)
   - On cache hit: add header X-Cache: HIT
   
   searchService.getCategories:
   - Cache key: 'categories:all'
   - TTL: 3600 seconds (1 hour)
   - Invalidate on admin category update
   
   searchService.getJobDetail:
   - Cache key: 'job:' + slug
   - TTL: 600 seconds (10 minutes)
   - Invalidate on job update

   recommendationService:
   - Already uses node-cache (swap to Redis for multi-server support)
   - Cache key: 'recommendations:' + userId
   - TTL: 3600 seconds

   API route caching middleware:
   server/src/middleware/cacheMiddleware.js:
   - cacheRoute(ttl) — middleware factory
   - Check cache with request URL as key
   - If hit: return cached response immediately
   - If miss: monkey-patch res.json to save response to cache, then send

2. Database Query Optimization:
   
   server/src/database/optimize.sql — run these commands:
   
   -- Add missing indexes (check with EXPLAIN ANALYZE first)
   CREATE INDEX CONCURRENTLY idx_applications_seeker_stage 
     ON applications(seeker_id, ats_stage, created_at DESC);
   
   CREATE INDEX CONCURRENTLY idx_jobs_active_published 
     ON job_listings(status, published_at DESC) 
     WHERE status = 'active';  -- partial index, much smaller
   
   CREATE INDEX CONCURRENTLY idx_notifications_user_unread 
     ON notifications(user_id, created_at DESC) 
     WHERE is_read = false;  -- partial index for unread only
   
   -- Analyze tables after adding indexes
   ANALYZE job_listings;
   ANALYZE applications;

   Cursor-based pagination (replace page/offset for large datasets):
   GET /api/jobs?after=<cursor>&limit=20
   - cursor = base64(lastJobId + ':' + lastPublishedAt)
   - WHERE published_at < :lastPublishedAt OR (published_at = :lastPublishedAt AND id < :lastId)
   - No COUNT(*) needed — faster for large datasets
   - Return: { jobs, nextCursor, hasMore }

   N+1 query prevention:
   - Always use include for related data in list queries (not lazy loading)
   - Use DataLoader pattern for batch loading in complex queries:
     npm install dataloader
     Create seekerProfileLoader that batches seeker ID lookups

3. Response Compression:
   npm install compression
   app.use(compression({ level: 6 }))  // Gzip all JSON responses
   Typically reduces response size by 60-80% for JSON

4. Connection Keep-Alive:
   server.js: server.keepAliveTimeout = 65000  // slightly above load balancer timeout
   server.headersTimeout = 66000

FRONTEND OPTIMIZATIONS:

5. Route-based code splitting (client/src/App.jsx):
   Replace static imports with React.lazy:
   const SeekerDashboard = lazy(() => import('./pages/seeker/DashboardPage'))
   const EmployerDashboard = lazy(() => import('./pages/employer/DashboardPage'))
   const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboardPage'))
   // etc. for ALL route-level components

   Wrap router in Suspense:
   <Suspense fallback={<PageLoader />}>
     <Routes>...</Routes>
   </Suspense>

   Create client/src/components/ui/PageLoader.jsx:
   - Full-page loading spinner with app logo
   - Fade in after 200ms delay (prevents flash for fast loads)

6. Virtualized lists with react-window:
   npm install react-window react-virtual

   Apply in: JobSearchPage, Admin UsersPage, Admin AuditLogPage (long lists)
   
   client/src/components/shared/VirtualJobList.jsx:
   - Use FixedSizeList from react-window
   - itemCount = total jobs, itemSize = 160 (card height in px)
   - renderItem = ({ index, style }) => <div style={style}><JobCard /></div>
   - Works with infinite scroll: load more when scrolling near bottom

7. React Query optimization (client/src/api/queryConfig.js):
   export const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 60 * 1000,         // 1 minute — don't refetch if data < 1min old
         gcTime: 5 * 60 * 1000,        // 5 minutes garbage collection
         retry: 1,                      // only retry once
         refetchOnWindowFocus: false,   // don't refetch on tab switch
       }
     }
   })
   
   Override per query type:
   - Categories: staleTime: 60 * 60 * 1000 (1 hour — rarely changes)
   - Notifications: staleTime: 30 * 1000 (30 seconds — need freshness)
   - Job search: staleTime: 2 * 60 * 1000 (2 minutes)

8. Image optimization:
   - Add loading="lazy" to all <img> tags not in initial viewport
   - Use width + height attributes to prevent layout shift (CLS)
   - Company logos: serve WebP with JPEG fallback:
     <picture>
       <source srcSet={logoUrl.replace('.jpg', '.webp')} type="image/webp" />
       <img src={logoUrl} alt={companyName} loading="lazy" />
     </picture>

9. Bundle analysis:
   npm install --save-dev rollup-plugin-visualizer
   
   vite.config.js: add to plugins:
   visualizer({ open: true, filename: 'dist/stats.html' })
   
   Run: npm run build
   Opens browser with interactive bundle treemap.
   Target: total bundle < 500KB gzipped; any single chunk < 200KB.

10. Prefetching critical routes:
    In App.jsx, prefetch likely next routes:
    - On hover of "My Applications" nav link → prefetch applications page
    - On job search page → prefetch job detail for hovered job cards (after 300ms hover)
    
    const prefetchJob = (slug) => {
      queryClient.prefetchQuery({
        queryKey: ['job', slug],
        queryFn: () => publicApi.getJobDetail(slug),
        staleTime: 10 * 60 * 1000,
      })
    }

Show complete implementation of all optimization techniques.
```

---

## Performance Targets

| Metric | Before | After Target | Tool |
|--------|--------|-------------|------|
| Initial bundle size | ~2MB | < 500KB | Vite visualizer |
| API response (cached) | 200ms | < 20ms | APM |
| API response (uncached) | 300ms | < 150ms | APM |
| Job search (cold) | 500ms | < 200ms | pg EXPLAIN |
| Job search (Redis hit) | 300ms | < 30ms | Redis INFO |
| Lighthouse Score | 65 | > 90 | Lighthouse |
| LCP | 4s | < 2.5s | Core Web Vitals |

---

## Redis Setup (Local Development)

```bash
# Mac
brew install redis
brew services start redis
redis-cli ping  # should return PONG

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis
redis-cli ping

# Verify connection
redis-cli info server | grep redis_version
```

---

## Key Concepts to Learn

- **Cache invalidation strategy** — TTL-based (expire after N seconds) vs event-based (explicitly delete on update); TTL is simpler; event-based is more accurate
- **Cache key design** — include version in key `v1:search:...` to allow cache busting on schema changes; include user ID for personalized data
- **Partial PostgreSQL indexes** — `WHERE status = 'active'` on index means only active rows are indexed; much smaller and faster than full-table index
- **Cursor pagination vs offset** — offset-based (`OFFSET 1000`) requires DB to scan and skip 1000 rows; cursor-based uses indexed WHERE clause; order of magnitude faster for large datasets
- **React.lazy + Suspense** — dynamic imports create separate chunks; only downloaded when route is visited; reduces initial bundle
- **`staleTime` vs `gcTime`** — `staleTime`: data is "fresh" for this long, no refetch; `gcTime`: how long to keep unused data in cache before garbage collecting

---

## Validation Checklist

- [ ] Second search request with same params returns X-Cache: HIT header
- [ ] Redis cache populated: `redis-cli keys "search:*"` shows entries
- [ ] Admin category update clears 'categories:all' cache key
- [ ] Initial page load: Network tab shows chunk files (vendor.js, ui.js separate)
- [ ] Hovering job card after 300ms prefetches job detail
- [ ] Job list with 200 items renders smoothly (react-window)
- [ ] Lighthouse production score > 90
- [ ] Bundle stats.html shows no single chunk > 200KB

---

## 🎉 Congratulations!

You have completed all 25 implementation prompts for the Job Portal & Recruitment Platform.

### What You Built:
- Full-stack React JS + Node.js application
- JWT authentication with refresh tokens and MFA
- Role-based access (Seeker, Employer, Admin)
- ATS Kanban board with drag-and-drop
- Real-time notifications with Socket.io
- AI resume parser and job recommendations
- Stripe subscription billing
- PostgreSQL full-text search
- Production deployment with CI/CD
- Comprehensive test suite
- Production-grade security hardening
- Performance optimization with Redis caching

### Next Steps to Learn:
- Add mobile app with React Native
- Implement video interview integration
- Add multi-language (i18n) support
- Build Chrome extension for job scraping
- Implement more advanced ML recommendations
