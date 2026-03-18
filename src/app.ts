import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { carsRouter } from "./routes";

export const app = express();

app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Cars API",
      version: "1.0.0",
      description: "A local Cars API for learning automated API testing",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      schemas: {
        Car: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            brand: { type: "string", example: "Volvo" },
            model: { type: "string", example: "XC90" },
            year: { type: "integer", example: 2022 },
            color: { type: "string", example: "Silver" },
            horsepower: { type: "integer", example: 249 },
            for_sale: { type: "boolean", example: true },
            created_at: { type: "string", example: "2024-01-15T12:00:00Z" },
          },
        },
        CreateCar: {
          type: "object",
          required: ["brand", "model", "year", "color", "horsepower"],
          properties: {
            brand: { type: "string", example: "Ferrari" },
            model: { type: "string", example: "Roma" },
            year: { type: "integer", example: 2023 },
            color: { type: "string", example: "Red" },
            horsepower: { type: "integer", example: 612 },
            for_sale: { type: "boolean", example: true },
          },
        },
        UpdateCar: {
          type: "object",
          properties: {
            brand: { type: "string", example: "Ferrari" },
            model: { type: "string", example: "Roma" },
            year: { type: "integer", example: 2023 },
            color: { type: "string", example: "Blue" },
            horsepower: { type: "integer", example: 612 },
            for_sale: { type: "boolean", example: false },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Car with id 99 not found" },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          tags: ["Health"],
          responses: { "200": { description: "API is running" } },
        },
      },
      "/api/cars": {
        get: {
          summary: "Get all cars",
          tags: ["Cars"],
          parameters: [{
            name: "brand",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by brand, e.g. Volvo",
          }],
          responses: {
            "200": {
              description: "List of cars",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { type: "array", items: { $ref: "#/components/schemas/Car" } },
                      count: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Create a new car",
          tags: ["Cars"],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateCar" } } },
          },
          responses: {
            "201": { description: "Car created" },
            "400": { description: "Invalid fields" },
            "409": { description: "Car already exists" },
          },
        },
      },
      "/api/cars/{id}": {
        get: {
          summary: "Get a car by id",
          tags: ["Cars"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Car found" },
            "404": { description: "Car not found" },
          },
        },
        patch: {
          summary: "Update a car",
          tags: ["Cars"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateCar" } } },
          },
          responses: {
            "200": { description: "Car updated" },
            "404": { description: "Car not found" },
          },
        },
        delete: {
          summary: "Delete a car",
          tags: ["Cars"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            "200": { description: "Car deleted" },
            "404": { description: "Car not found" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Cars API is running" });
});

app.use("/api/cars", carsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});