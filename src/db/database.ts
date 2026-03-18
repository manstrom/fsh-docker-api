import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database;

export async function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_PATH || './data/cars.db';
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        color TEXT NOT NULL,
        horsepower INTEGER NOT NULL,
        for_sale BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  return db;
}

export async function seedDb() {
  const db = await getDb();
  const count = await db.get('SELECT COUNT(*) as count FROM cars');
  
  if (count.count === 0) {
    await db.exec(`
      INSERT INTO cars (brand, model, year, color, horsepower, for_sale) VALUES 
      ('Volvo', 'XC90', 2022, 'Silver', 249, true),
      ('BMW', 'X5', 2023, 'Black', 335, true),
      ('Audi', 'A6', 2021, 'White', 261, false),
      ('Mercedes', 'C-Class', 2022, 'Blue', 255, true),
      ('Toyota', 'Corolla', 2023, 'Red', 169, true),
      ('Volkswagen', 'Golf', 2022, 'Green', 148, false),
      ('Ford', 'Mustang', 2023, 'Yellow', 450, true),
      ('Tesla', 'Model 3', 2023, 'White', 283, true)
    `);
  }
  
  return db;
}