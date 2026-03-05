import { MongoClient } from "mongodb"
import "dotenv/config"

let client = null
let db = null

export async function connectMongo() {
  if (!db) {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined. Check your .env file.")
    }
    client = new MongoClient(process.env.MONGO_URI)
    await client.connect()
    db = client.db(process.env.MONGO_DB)
    console.log("MongoDB connected successfully")
  }
  return db
}

export function getDb() {
  if (!db) throw new Error("MongoDB not connected. Call connectMongo() first.")
  return db
}

export function getClient() {
  return client
}

export default { connectMongo, getDb, getClient }
