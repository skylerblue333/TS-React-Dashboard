import request from "supertest";

import { createApp, type MetricsProvider } from "../src/index";

const sample = {
  activeUsers: 42,
  revenue: 1234.5,
  uptime: 0.999,
  charts: { daily: [1, 2, 3] },
};

describe("Sky Dashboard Metrics", () => {
  it("reports liveness while readiness reflects provider configuration", async () => {
    const app = createApp();
    expect((await request(app).get("/healthz")).body.status).toBe("ok");
    const ready = await request(app).get("/readyz");
    expect(ready.status).toBe(503);
    expect(ready.body.ready).toBe(false);
  });

  it("does not fabricate metrics without a provider", async () => {
    const response = await request(createApp()).get("/api/v1/dashboard/metrics");
    expect(response.status).toBe(503);
    expect(response.body.status).toBe("unavailable");
    expect(response.body.metrics).toBeUndefined();
  });

  it("returns metrics supplied by the configured provider", async () => {
    const provider: MetricsProvider = { read: async () => sample };
    const response = await request(createApp(provider)).get("/api/v1/dashboard/metrics");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", metrics: sample });
  });

  it("maps provider failures to a bounded upstream error", async () => {
    const provider: MetricsProvider = {
      read: async () => {
        throw new Error("secret upstream detail");
      },
    };
    const response = await request(createApp(provider)).get("/api/v1/dashboard/metrics");
    expect(response.status).toBe(502);
    expect(response.body).toEqual({ status: "unavailable", reason: "metrics_source_failed" });
    expect(JSON.stringify(response.body)).not.toContain("secret upstream detail");
  });
});
