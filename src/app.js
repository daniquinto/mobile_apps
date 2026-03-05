import "dotenv/config"
import express from "express"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { connectMongo } from "./config/db/mongo.js"
import pool from "./config/db/mysql.js"
import router from "./routes/index.js"
import { notFound } from "./middlewares/notFound.js"
import { errorHandler } from "./middlewares/errorHandler.js"

const app = express()
const PORT = process.env.PORT || 3000
const __dirname = dirname(fileURLToPath(import.meta.url))

// Allow the browser dashboard to call the API
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (req.method === "OPTIONS") return res.sendStatus(204)
  next()
})

app.use(express.json())

// Serve the visual dashboard
app.use(express.static(join(__dirname, "../public")))

// All API routes
app.use("/api", router)

// 404 and error handling (must be last)
app.use(notFound)
app.use(errorHandler)

async function startServer() {
  await pool.query("SELECT 1")
  console.log("MySQL connected")

  await connectMongo()

  app.listen(PORT, () => {
    console.log(`Server running  → http://localhost:${PORT}`)
    console.log(`Dashboard       → http://localhost:${PORT}/index.html`)
  })
}

startServer().catch((err) => {
  console.error("Failed to start server:", err)
  process.exit(1)
})
