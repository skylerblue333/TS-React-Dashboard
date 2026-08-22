import request from "supertest";
import { app } from "../src/index";

describe("TS-React-Dashboard", () => {
  it("returns a health status", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "healthy", service: "TS-React-Dashboard" });
  });

  it("does not fabricate metrics when no provider is configured", async () => {
    const response = await request(app).get("/api/dashboard/metrics");
    expect(response.status).toBe(503);
    expect(response.body.status).toBe("unavailable");
    expect(response.body.activeUsers).toBeUndefined();
    expect(response.body.revenue).toBeUndefined();
  });
});
