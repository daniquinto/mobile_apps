import { getDb } from "../config/db/mongo.js"

/**
 * Save an audit event to MongoDB.
 * Used to track deletions and key operations.
 */
export async function logEvent(payload) {
  try {
    const db = getDb()
    await db.collection("audit_logs").insertOne({
      ...payload,
      createdAt: new Date()
    })
  } catch (err) {
    // Log to console but don't crash the main operation
    console.error("Audit log failed:", err.message)
  }
}
