/**
 * Standalone migration script.
 * Run with: npm run migrate
 */
import "dotenv/config"
import { connectMongo } from "../config/db/mongo.js"
import { runMigration } from "../services/migrationService.js"
import { logEvent } from "../utils/logger.js"
import pool from "../config/db/mysql.js"

async function main() {
  await pool.query("SELECT 1")
  console.log("MySQL connected")
  await connectMongo()
  console.log("MongoDB connected")

  await logEvent({ event_type: "MIGRATION_STARTED", source: "cli" })
  const result = await runMigration()
  await logEvent({ event_type: "MIGRATION_COMPLETED", ...result })

  console.log("Migration complete:", result)
  process.exit(0)
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
