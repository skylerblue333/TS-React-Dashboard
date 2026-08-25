import express, { type Express, type Request, type Response } from "express";
import { z } from "zod";

const PORT = Number.parseInt(process.env.PORT ?? "3000", 10);
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const MetricsSchema = z
  .object({
    activeUsers: z.number().int().nonnegative(),
    revenue: z.number().finite().nonnegative(),
    uptime: z.number().finite().min(0).max(1),
    charts: z.object({ daily: z.array(z.number().finite()).max(366) }).strict(),
  })
  .strict();

export type DashboardMetrics = z.infer<typeof MetricsSchema>;
export type MetricsProvider = { read(): Promise<DashboardMetrics> };

export class HttpMetricsProvider implements MetricsProvider {
  constructor(
    private readonly sourceUrl: URL,
    private readonly timeoutMs = 2_000,
  ) {
    if (!['http:', 'https:'].includes(sourceUrl.protocol)) {
      throw new Error('METRICS_SOURCE_URL must use http or https');
    }
    if (sourceUrl.username || sourceUrl.password) {
      throw new Error('METRICS_SOURCE_URL must not contain embedded credentials');
    }
    if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 10_000) {
      throw new Error('metrics timeout must be between 100 and 10000 ms');
    }
  }

  async read(): Promise<DashboardMetrics> {
    const response = await fetch(this.sourceUrl, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!response.ok) throw new Error(`metrics source returned HTTP ${response.status}`);
    return MetricsSchema.parse(await response.json());
  }
}

export function createApp(provider?: MetricsProvider): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));

  app.get("/healthz", (_request: Request, response: Response) => {
    response.json({ status: "ok", service: "sky-dashboard-metrics" });
  });

  app.get("/readyz", (_request: Request, response: Response) => {
    if (!provider) {
      response.status(503).json({ ready: false, reason: "metrics_provider_not_configured" });
      return;
    }
    response.json({ ready: true });
  });

  app.get("/api/v1/dashboard/metrics", async (_request: Request, response: Response) => {
    if (!provider) {
      response.status(503).json({
        status: "unavailable",
        reason: "No metrics provider is configured; dashboard values are intentionally not fabricated.",
      });
      return;
    }
    try {
      response.json({ status: "ok", metrics: await provider.read() });
    } catch (error) {
      console.error(JSON.stringify({ event: "metrics_read_failed", message: error instanceof Error ? error.message : "unknown" }));
      response.status(502).json({ status: "unavailable", reason: "metrics_source_failed" });
    }
  });

  return app;
}

function providerFromEnvironment(): MetricsProvider | undefined {
  const raw = process.env.METRICS_SOURCE_URL?.trim();
  if (!raw) return undefined;
  return new HttpMetricsProvider(new URL(raw));
}

export const app = createApp(providerFromEnvironment());

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(JSON.stringify({ event: "server_started", service: "sky-dashboard-metrics", port: PORT }));
  });
}
