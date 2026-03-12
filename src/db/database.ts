import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://cars:cars123@localhost:5432/carsdb",
});

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cars (
      id         SERIAL PRIMARY KEY,
      brand      TEXT    NOT NULL,
      model      TEXT    NOT NULL,
      year       INTEGER NOT NULL CHECK (year >= 1886),
      color      TEXT    NOT NULL,
      horsepower INTEGER NOT NULL CHECK (horsepower > 0),
      for_sale   BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (brand, model, year, color)
    );
  `);
}

export async function seedDb(): Promise<void> {
  await initDb();
  await pool.query("TRUNCATE TABLE cars RESTART IDENTITY;");

  const cars = [
    { brand: "Volvo",    model: "XC90",   year: 2022, color: "Silver", horsepower: 249, for_sale: true  },
    { brand: "BMW",      model: "M3",     year: 2021, color: "Blue",   horsepower: 503, for_sale: false },
    { brand: "Toyota",   model: "Supra",  year: 2023, color: "Red",    horsepower: 382, for_sale: true  },
    { brand: "Ford",     model: "Mustang",year: 2020, color: "Yellow", horsepower: 450, for_sale: true  },
    { brand: "Tesla",    model: "Model S",year: 2023, color: "White",  horsepower: 670, for_sale: false },
    { brand: "Porsche",  model: "911",    year: 2022, color: "Black",  horsepower: 379, for_sale: true  },
    { brand: "Audi",     model: "RS6",    year: 2021, color: "Gray",   horsepower: 600, for_sale: false },
    { brand: "Mercedes", model: "AMG GT", year: 2023, color: "Silver", horsepower: 557, for_sale: true  },
  ];

  for (const car of cars) {
    await pool.query(
      "INSERT INTO cars (brand, model, year, color, horsepower, for_sale) VALUES ($1, $2, $3, $4, $5, $6)",
      [car.brand, car.model, car.year, car.color, car.horsepower, car.for_sale]
    );
  }
}