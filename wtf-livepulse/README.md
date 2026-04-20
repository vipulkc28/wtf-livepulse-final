# WTF LivePulse

Runnable v1 for a real-time multi-gym intelligence engine.

## Stack
- Frontend: React 18 + Vite + Zustand
- Backend: Node.js 20 + Express 4 + ws + pg
- Database: PostgreSQL 15
- Protocols: REST + WebSockets
- Local runtime: Docker Compose

## What is included
- Cold-startable repo scaffold
- PostgreSQL schema, indexes, materialized view, and benchmark queries
- Full backend seed engine that generates:
  - 10 exact gyms
  - 5,000 members
  - 200k+ historical check-ins
  - payment history
  - startup anomaly scenarios
- Anomaly detection engine with zero-checkin, capacity-breach, and revenue-drop rules
- Live simulator with check-in, check-out, and payment generation
- React dashboard shell and live event plumbing
- Node test coverage for core rule paths

## Quick start
```bash
docker compose up --build
```

## Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- WebSocket: ws://localhost:3001/ws
- Postgres: localhost:5432

## Seed behavior
The backend runs `ensureSeeded()` on startup after the schema migrations complete. If the dataset is already present, startup skips reseeding.

## Benchmarks
Benchmark SQL lives in:

```text
backend/src/db/queries/benchmark_queries.sql
```

Run each with:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
...
```

## Tests
Backend tests use the Node built-in test runner:

```bash
cd backend
npm test
```

## Notes
- Local baseline remains exactly 3 services: `db`, `backend`, `frontend`.
- The seed intentionally forces:
  - Bandra West capacity breach
  - Velachery zero-checkins state
  - Salt Lake revenue drop
