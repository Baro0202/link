# URL Shortener Backend (Fastify + Redis)

## Local Dev

```bash
npm install
npm run dev
```

Environment variables:

- PORT (default 3000)
- HOST (default 0.0.0.0)
- BASE_URL (e.g., http://localhost:8080)
- REDIS_HOST (default 127.0.0.1)
- REDIS_PORT (default 6379)
- SHORT_URL_TTL_SECONDS (optional ttl for links)
- CORS_ORIGIN (default \*)

## API

- POST `/api/shorten` → `{ short_url }`
- GET `/:short_code` → 301 redirect or 404
- GET `/healthz` → ok

## Tests

```bash
npm test
```

## Bench (needs a valid short code)

```bash
BENCH_URL=http://localhost:8080/abc npm run bench
```
