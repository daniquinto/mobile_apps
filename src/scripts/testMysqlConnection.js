import "dotenv/config"
import pool from "../config/db/mysql.js"

pool.query("SELECT 1 AS ok")
  .then(() => { console.log("MySQL connection OK"); process.exit(0) })
  .catch((err) => { console.error("MySQL connection FAILED:", err.message); process.exit(1) })
