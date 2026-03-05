import "dotenv/config"
import { connectMongo, getClient } from "../config/db/mongo.js"

connectMongo()
  .then(() => {
    console.log("MongoDB connection OK")
    getClient().close()
  })
  .catch((err) => {
    console.error("MongoDB connection FAILED:", err.message)
    process.exit(1)
  })
