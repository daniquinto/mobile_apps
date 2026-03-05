import "dotenv/config"
import { MongoClient } from "mongodb"

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined. Check your .env file.")
  process.exit(1)
}

const client = new MongoClient(process.env.MONGO_URI)

async function setup() {
  await client.connect()
  const db = client.db(process.env.MONGO_DB)

  const validator = {
    $jsonSchema: {
      bsonType: "object",
      required: ["entity", "entityId", "deletedAt", "payload"],
      properties: {
        entity:    { bsonType: "string" },
        entityId:  { bsonType: ["string", "int", "long"] },
        deletedAt: { bsonType: "date" },
        payload:   { bsonType: "object" }
      }
    }
  }

  const collections = await db.listCollections({ name: "audit_logs" }).toArray()
  if (collections.length === 0) {
    await db.createCollection("audit_logs", { validator, validationLevel: "moderate", validationAction: "warn" })
    console.log("audit_logs collection created with schema validation")
  } else {
    await db.command({ collMod: "audit_logs", validator })
    console.log("audit_logs schema validation updated")
  }

  await db.collection("audit_logs").createIndex(
    { entity: 1, entityId: 1, deletedAt: 1 },
    { name: "idx_audit_entity_id_date" }
  )
  console.log("Index created on audit_logs")
  await client.close()
}

setup().catch(console.error)
