import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { seedDb } from "../src/db/database";

beforeAll(async () => {
  await seedDb();
});

describe("GET /health", () => {
  it("should return status 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });

  it("should return a JSON body with status 'ok'", async () => {
    const res = await request(app).get("/health");
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/cars", () => {
  it("should return status 200", async () => {
    const res = await request(app).get("/api/cars");
    expect(res.status).toBe(200);
  });

  it("should return an array of cars in the 'data' field", async () => {
    const res = await request(app).get("/api/cars");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should return a 'count' that matches number of cars", async () => {
    const res = await request(app).get("/api/cars");
    expect(res.body.count).toBe(res.body.data.length);
  });
});