import { Router, Request, Response } from "express";
import { getDb } from "./db/database";
import { CreateCarBody, UpdateCarBody } from "./types";

export const carsRouter = Router();

// GET /api/cars
carsRouter.get("/", async (req: Request, res: Response) => {
  const db = await getDb();
  const { brand } = req.query;

  let cars;
  if (brand && typeof brand === "string") {
    cars = await db.all(
      "SELECT * FROM cars WHERE brand LIKE ? ORDER BY id",
      [`%${brand}%`]
    );
  } else {
    cars = await db.all("SELECT * FROM cars ORDER BY id");
  }

  res.json({ data: cars, count: cars.length });
});

// GET /api/cars/:id
carsRouter.get("/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id — must be a number" });
    return;
  }

  const car = await db.get("SELECT * FROM cars WHERE id = ?", [id]);

  if (!car) {
    res.status(404).json({ error: `Car with id ${id} not found` });
    return;
  }

  res.json(car);
});

// POST /api/cars
carsRouter.post("/", async (req: Request, res: Response) => {
  const db = await getDb();
  const { brand, model, year, color, horsepower, for_sale = false }: CreateCarBody = req.body;

  // Validering
  if (!brand || typeof brand !== "string" || brand.trim() === "") {
    res.status(400).json({ error: "Field 'brand' is required" });
    return;
  }
  if (!model || typeof model !== "string" || model.trim() === "") {
    res.status(400).json({ error: "Field 'model' is required" });
    return;
  }
  if (!year || typeof year !== "number" || year < 1886) {
    res.status(400).json({ error: "Field 'year' must be a number >= 1886" });
    return;
  }
  if (!color || typeof color !== "string" || color.trim() === "") {
    res.status(400).json({ error: "Field 'color' is required" });
    return;
  }
  if (!horsepower || typeof horsepower !== "number" || horsepower <= 0) {
    res.status(400).json({ error: "Field 'horsepower' must be a positive number" });
    return;
  }

  // Kolla om bilen redan finns
  const existing = await db.get(
    "SELECT id FROM cars WHERE brand = ? AND model = ? AND year = ? AND color = ?",
    [brand.trim(), model.trim(), year, color.trim()]
  );
  
  if (existing) {
    res.status(409).json({ error: "A car with the same brand, model, year and color already exists" });
    return;
  }

  // Skapa ny bil
  const result = await db.run(
    "INSERT INTO cars (brand, model, year, color, horsepower, for_sale) VALUES (?, ?, ?, ?, ?, ?) RETURNING *",
    [brand.trim(), model.trim(), year, color.trim(), horsepower, for_sale]
  );

  const newCar = await db.get("SELECT * FROM cars WHERE id = ?", [result.lastID]);
  res.status(201).json(newCar);
});

// PATCH /api/cars/:id
carsRouter.patch("/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id — must be a number" });
    return;
  }

  const car = await db.get("SELECT * FROM cars WHERE id = ?", [id]);
  if (!car) {
    res.status(404).json({ error: `Car with id ${id} not found` });
    return;
  }

  const body: UpdateCarBody = req.body;
  const updates: string[] = [];
  const values: any[] = [];

  if (body.brand !== undefined) {
    if (typeof body.brand !== "string" || body.brand.trim() === "") {
      res.status(400).json({ error: "Field 'brand' must be a non-empty string" });
      return;
    }
    updates.push("brand = ?");
    values.push(body.brand.trim());
  }
  if (body.model !== undefined) {
    if (typeof body.model !== "string" || body.model.trim() === "") {
      res.status(400).json({ error: "Field 'model' must be a non-empty string" });
      return;
    }
    updates.push("model = ?");
    values.push(body.model.trim());
  }
  if (body.year !== undefined) {
    if (typeof body.year !== "number" || body.year < 1886) {
      res.status(400).json({ error: "Field 'year' must be a number >= 1886" });
      return;
    }
    updates.push("year = ?");
    values.push(body.year);
  }
  if (body.color !== undefined) {
    if (typeof body.color !== "string" || body.color.trim() === "") {
      res.status(400).json({ error: "Field 'color' must be a non-empty string" });
      return;
    }
    updates.push("color = ?");
    values.push(body.color.trim());
  }
  if (body.horsepower !== undefined) {
    if (typeof body.horsepower !== "number" || body.horsepower <= 0) {
      res.status(400).json({ error: "Field 'horsepower' must be a positive number" });
      return;
    }
    updates.push("horsepower = ?");
    values.push(body.horsepower);
  }
  if (body.for_sale !== undefined) {
    updates.push("for_sale = ?");
    values.push(body.for_sale ? 1 : 0);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: "No valid fields provided to update" });
    return;
  }

  values.push(id);
  await db.run(
    `UPDATE cars SET ${updates.join(", ")} WHERE id = ?`,
    values
  );

  const updatedCar = await db.get("SELECT * FROM cars WHERE id = ?", [id]);
  res.json(updatedCar);
});

// DELETE /api/cars/:id
carsRouter.delete("/:id", async (req: Request, res: Response) => {
  const db = await getDb();
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id — must be a number" });
    return;
  }

  const car = await db.get("SELECT * FROM cars WHERE id = ?", [id]);
  if (!car) {
    res.status(404).json({ error: `Car with id ${id} not found` });
    return;
  }

  await db.run("DELETE FROM cars WHERE id = ?", [id]);

  res.json({
    message: `Car '${car.brand} ${car.model}' was deleted`,
    deleted: car,
  });
});