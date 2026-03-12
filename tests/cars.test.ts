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

  it.todo("each car should have required fields: id, brand, model, year, color, horsepower, for_sale");
  it.todo("should filter cars by brand using ?brand= query parameter");
  it.todo("should return empty array when no cars match the brand filter");
});

describe("GET /api/cars/:id", () => {
  it("should return status 200 for an existing car", async () => {
    const res = await request(app).get("/api/cars/1");
    expect(res.status).toBe(200);
  });

  it("should return the correct car", async () => {
    const res = await request(app).get("/api/cars/1");
    expect(res.body.brand).toBe("Volvo");
    expect(res.body.id).toBe(1);
  });

  it.todo("should return 404 for a non-existent car id");
  it.todo("should return 400 for an invalid (non-numeric) id");
  it.todo("'for_sale' field should be a boolean");
});

describe("POST /api/cars", () => {
  it("should create a new car and return 201", async () => {
    const newCar = {
      brand: "Testbrand",
      model: "Testmodel",
      year: 2020,
      color: "Green",
      horsepower: 150,
    };

    const res = await request(app).post("/api/cars").send(newCar);
    expect(res.status).toBe(201);
    expect(res.body.brand).toBe("Testbrand");
    expect(res.body.id).toBeDefined();
  });

  it.todo("should correctly store for_sale: true when provided");
  it.todo("should return 400 when 'brand' is missing");
  it.todo("should return 400 when 'horsepower' is missing");
  it.todo("should return 400 when year is before 1886");
  it.todo("should return 409 when a duplicate car already exists");
});

describe("PATCH /api/cars/:id", () => {
  it("should update a field and return the updated car", async () => {
    const res = await request(app)
      .patch("/api/cars/2")
      .send({ for_sale: true });

    expect(res.status).toBe(200);
    expect(res.body.for_sale).toBe(true);
    expect(res.body.brand).toBe("BMW");
  });

  it.todo("should update color and return the new value");
  it.todo("should return 404 when trying to update a non-existent car");
  it.todo("should return 400 when body has no valid fields");
  it.todo("should persist the updated brand when fetched again");
});

describe("DELETE /api/cars/:id", () => {
  it("should delete a car and return 200 with a confirmation message", async () => {
    const created = await request(app).post("/api/cars").send({
      brand: "DeleteBrand",
      model: "DeleteModel",
      year: 2000,
      color: "Pink",
      horsepower: 100,
    });

    const id = created.body.id;
    const res = await request(app).delete(`/api/cars/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("DeleteBrand");
  });

  it.todo("deleted car should return 404 when fetched again");
  it.todo("should return 404 when deleting a non-existent car");
  it.todo("response body should include the deleted car's data");
});

describe("BONUS", () => {
  it.todo("full flow: create → update → delete");
  it.todo("all endpoints should return Content-Type application/json");
  it.todo("brand filter should be case-insensitive");
});