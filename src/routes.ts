import { Router, Request, Response } from "express";
import { pool } from "./db/database";
import { CreateCarBody, UpdateCarBody } from "./types";

export const carsRouter = Router();

carsRouter.get("/", async (req: Request, res: Response) => {
  const { brand } = req.query;

  let result;
  if (brand && typeof brand === "string") {
    result = await pool.query(
      "SELECT * FROM cars WHERE brand ILIKE $1 ORDER BY id",
      [`%${brand}%`]
    );
  } else {
    result = await pool.query("SELECT * FROM cars ORDER BY id");
  }

  res.json({ data: result.rows, count: result.rowCount });
});

carsRouter.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id — must be a number" });
    return;
  }

  const result = await pool.query("SELECT * FROM cars WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    res.status(404).json({ error: `Car with id ${id} not found` });
    return;
  }

  res.json(result.rows[0]);
});

carsRouter.post("/", async (req: Request, res: Response) => {
  const { brand, model, year, color, horsepower, for_sale = false }: CreateCarBody = req.body;

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

  const existing = await pool.query(
    "SELECT id FROM cars WHERE brand = $1 AND model = $2 AND year = $3 AND color = $4",
    [brand.trim(), model.trim(), year, color.trim()]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    res.status(409).json({ error: "A car with the same brand, model, year and color already exists" });
    return;
  }

  const result = await pool.query(
    "INSERT INTO cars (brand, model, year, color, horsepower, for_sale) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [brand.trim(), model.trim(), year, color.trim(), horsepower, for_sale]
  );

  res.status(201).json(result.rows[0]);
});

carsRouter.patch("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id — must be a number" });
    return;
  }

  const check = await pool.query("SELECT id FROM cars WHERE id = $1", [id]);
  if (check.rowCount === 0) {
    res.status(404).json({ error: `Car with id ${id} not found` });
    return;
  }

  const body: UpdateCarBody = req.body;
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (body.brand !== undefined) {
    if (typeof body.brand !== "string" || body.brand.trim() === "") {
      res.status(400).json({ error: "Field 'brand' must be a non-empty string" });
      return;
    }
    updates.push(`brand = $${paramCount++}`);
    values.push(body.brand.trim());
  }
  if (body.model !== undefined) {
    if (typeof body.model !== "string" || body.model.trim() === "") {
      res.status(400).json({ error: "Field 'model' must be a non-empty string" });
      return;
    }
    updates.push(`model = $${paramCount++}`);
    values.push(body.model.trim());
  }
  if (body.year !== undefined) {
    if (typeof body.year !== "number" || body.year < 1886) {
      res.status(400).json({ error: "Field 'year' must be a number >= 1886" });
      return;
    }
    updates.push(`year = $${paramCount++}`);
    values.push(body.year);
  }
  if (body.color !== undefined) {
    if (typeof body.color !== "string" || body.color.trim() === "") {
      res.status(400).json({ error: "Field 'color' must be a non-empty string" });
      return;
    }
    updates.push(`color = $${paramCount++}`);
    values.push(body.color.trim());
  }
  if (body.horsepower !== undefined) {
    if (typeof body.horsepower !== "number" || body.horsepower <= 0) {
      res.status(400).json({ error: "Field 'horsepower' must be a positive number" });
      return;
    }
    updates.push(`horsepower = $${paramCount++}`);
    values.push(body.horsepower);
  }
  if (body.for_sale !== undefined) {
    updates.push(`for_sale = $${paramCount++}`);
    values.push(body.for_sale);
  }

  if (updates.length === 0) {
    res.status(400).json({ error: "No valid fields provided to update" });
    return;
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE cars SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
    values
  );

  res.json(result.rows[0]);
});

carsRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id — must be a number" });
    return;
  }

  const existing = await pool.query("SELECT * FROM cars WHERE id = $1", [id]);
  if (existing.rowCount === 0) {
    res.status(404).json({ error: `Car with id ${id} not found` });
    return;
  }

  await pool.query("DELETE FROM cars WHERE id = $1", [id]);

  res.json({
    message: `Car '${existing.rows[0].brand} ${existing.rows[0].model}' was deleted`,
    deleted: existing.rows[0],
  });
});