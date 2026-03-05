import { getDb } from "../config/db/mongo.js"

/**
 * Insert a deletion audit log into MongoDB.
 */
export async function createAuditLog({ entity, entityId, payload }) {
  const db = getDb()
  await db.collection("audit_logs").insertOne({
    entity,
    entityId,
    deletedAt: new Date(),
    payload
  })
}
