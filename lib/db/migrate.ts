import { Database } from "bun:sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { drizzle } from "drizzle-orm/bun-sqlite";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

export function runMigrations() {
  const dbPath = path.join(process.cwd(), "data", "planner.db");
  const dataDir = path.dirname(dbPath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const sqlite = new Database(dbPath, { create: true, readwrite: true });
  const db = drizzle(sqlite, { schema });

  migrate(db, { migrationsFolder: "./lib/db/migrations" });
  console.log("Migrations completed!");
}

if (import.meta.main) {
  runMigrations();
}
