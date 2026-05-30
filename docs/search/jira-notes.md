# Search — Jira Notes

---

## Epic: JP-SEARCH — Job Search & Discovery

**Priority:** Critical | **Status:** Production

---

## Stories

### JP-SEARCH-001: Full-Text Search
**Points:** 5 | **Status:** Done

### JP-SEARCH-002: Faceted Filter System
**Points:** 5 | **Status:** Done

### JP-SEARCH-003: URL-Based Filter State
**Points:** 3 | **Status:** Done

**Decision:** All filter state stored in URL search params, not React state. Enables shareable/bookmarkable filtered searches and browser back/forward navigation.

### JP-SEARCH-004: Search Logging
**Points:** 2 | **Status:** Done

### JP-SEARCH-005: Autocomplete
**Points:** 3 | **Status:** Done

### JP-SEARCH-006: Category Browse
**Points:** 2 | **Status:** Done

---

## Future: Elasticsearch Migration

When the job count exceeds ~100k or search latency degrades beyond 500ms p95, migrate to Elasticsearch:
- Better relevance tuning (BM25, field boosting)
- Facet aggregations (counts per filter value)
- Geo search for location-based ranking
- Typo tolerance / stemming improvements
