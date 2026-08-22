import express, { type Express, type Request, type Response } from "express";

export type DashboardMetrics = {
  activeUsers: number;
  revenue: number;
  uptime: number;
  charts: { daily: number[] };
};

export type MetricsProvider = { read(): Promise<DashboardMetrics> };

export const app: Express = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

app.get("/health", (_request: Request, response: Response) => {
  response.json({ status: "healthy", service: "TS-React-Dashboard" });
});

app.get("/api/dashboard/metrics", (_request: Request, response: Response) => {
  response.status(503).json({
    status: "unavailable",
    reason: "No metrics provider is configured; dashboard values are intentionally not fabricated.",
  });
});

if (require.main === module) {
  app.listen(3000, () => console.log("Dashboard service listening on port 3000"));
}
