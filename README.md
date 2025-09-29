# URL Shortener (Fastify + Redis + Next.js + Nginx)

Production-like, horizontally scalable URL shortener you can run locally for free.

## Stack

- Backend: Node.js 18, Fastify, Redis (as KV + cache)
- Frontend: Next.js (pages) React app
- Proxy/LB: Nginx
- Orchestration: Docker Compose

## Run locally

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:3000
- LB/API: http://localhost:8080
- Redis: 6379

## Scale backend

```bash
docker compose up --build --scale backend=3
```

Nginx load-balances across backend replicas using Docker DNS `backend:3000`.

## API

- POST `/api/shorten` body `{ "url": "https://example.com" }` → `{ "short_url": "http://localhost:8080/abc" }`
- GET `/:short_code` → 301 redirect or 404
- GET `/healthz` → 200 ok

## Benchmarks

Create a short code first:

```bash
curl -s -X POST http://localhost:8080/api/shorten -H 'content-type: application/json' -d '{"url":"https://example.com"}'
```

Then run:

```bash
docker compose exec backend node scripts/bench.js
# or locally from backend: npm run bench (ensure BENCH_URL points to a valid code)
```

Note: 10k RPS is achievable when horizontally scaled with multiple backend replicas and sufficient hardware. Locally, performance depends on machine resources and Docker overhead.

## Environment

Copy `.env.example` to `.env` and adjust as needed. All ports are configurable. TTL is optional (`SHORT_URL_TTL_SECONDS`).

## Development

You can run backend and frontend outside Docker too.

Backend:

```bash
cd backend && npm install && npm run dev
```

Frontend:

```bash
cd frontend && npm install && npm run dev
```
