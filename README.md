# TypeScript Dashboard Service

A small Express service boundary for dashboard health and metrics. It is not currently a React admin dashboard, and it does not fabricate users, revenue, uptime, or chart data.

## Implemented behavior

`GET /health` returns service health. `GET /api/dashboard/metrics` returns `503 Service Unavailable` with an explicit explanation until a real metrics provider is configured. The metrics contract is typed so a later provider can be integrated without silently changing the API shape.

## Validation

```bash
pnpm install
pnpm run build
pnpm test --runInBand
```

The build and test suite pass. Tests cover the health response and confirm that unavailable metrics are not represented as fake business values.

## Scope and limitations

This repository currently has no React UI, persistence, authentication, authorization, telemetry provider, chart implementation, or deployment evidence. It must not be described as an enterprise admin dashboard until those parts are implemented and tested. The previous “enterprise,” “scalable,” and “cloud-native” claims were removed because the source did not substantiate them.
