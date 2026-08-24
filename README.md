# Sky Dashboard Metrics

This repository's historical name is **TS-React-Dashboard**, but the implemented product is a TypeScript/Express dashboard-metrics adapter service. It does not currently contain a React UI.

**Status: engineering beta.**

## What it does

- `GET /healthz` — process liveness.
- `GET /readyz` — reports ready only when a metrics provider is configured.
- `GET /api/v1/dashboard/metrics` — reads metrics from the configured provider.
- Optional `METRICS_SOURCE_URL` HTTP(S) provider with a bounded 2-second request timeout.
- Strict schema validation for active users, revenue, uptime ratio, and daily chart values.
- Upstream failures return a bounded `502` response without leaking upstream error details.
- If no provider is configured, metrics return `503`; values are never fabricated.

## Run

```bash
pnpm install --frozen-lockfile
pnpm run build
METRICS_SOURCE_URL=https://metrics.example.internal/dashboard PORT=3000 pnpm start
```

The upstream JSON contract is:

```json
{
  "activeUsers": 42,
  "revenue": 1234.5,
  "uptime": 0.999,
  "charts": { "daily": [1, 2, 3] }
}
```

`uptime` is a ratio from 0 to 1 and `charts.daily` is limited to 366 finite numbers. `METRICS_SOURCE_URL` must be absolute HTTP(S) and may not contain embedded credentials.

## Verification

CI uses Node 22 and the committed pnpm lockfile. It enforces the TypeScript build, Jest tests, production dependency audit, Docker build, non-root image verification, and a real container `/healthz` request.

## Scope limits

This service does not provide a React dashboard, authentication, authorization, persistent metrics storage, analytics computation, business-source connectors, tenant isolation, distributed caching, HA, or production deployment. Revenue is passed through as supplied by the configured authoritative provider; this service does not calculate accounting values.

## SKYCOIN4444 integration

Use this service as a stable adapter between authoritative ecosystem telemetry/business metric sources and dashboard consumers. Keep authentication, source authorization, network egress policy, and authoritative metric computation outside this adapter until those capabilities are explicitly implemented and tested.

See `SECURITY.md` and `CHANGELOG.md` for security boundaries and product history.
