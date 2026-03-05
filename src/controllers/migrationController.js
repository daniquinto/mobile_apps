import { runMigration } from "../services/migrationService.js"
import { logEvent } from "../utils/logger.js"

export async function importData(req, res, next) {
  try {
    await logEvent({ event_type: "MIGRATION_STARTED", source: "api" })
    const result = await runMigration()
    await logEvent({ event_type: "MIGRATION_COMPLETED", ...result })
    res.json({ success: true, message: "Migration completed", data: result })
  } catch (err) { next(err) }
}
