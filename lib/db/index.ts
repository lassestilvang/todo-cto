import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { lists } from "./schema";
import { nanoid } from "@/lib/utils";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "planner.db");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });

// Initialize default Inbox list if it doesn't exist
export function initializeDefaultList() {
  try {
    const existingLists = db.select().from(lists).all();

    if (existingLists.length === 0) {
      db.insert(lists)
        .values({
          id: nanoid(),
          name: "Inbox",
          color: "#3b82f6",
          icon: "📥",
          isDefault: true,
        })
        .run();
    }
  } catch (error) {
    console.error("Error initializing default list:", error);
  }
}
