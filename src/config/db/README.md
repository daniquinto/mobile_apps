# config/db

This folder contains the database connection modules.

| File | Purpose |
|------|---------|
| `mongo.js` | Creates a singleton MongoDB client using the `mongodb` driver. Exports `connectMongo()` (called at startup) and `getDb()` (used inside repositories). |
| `mysql.js` | Creates a MySQL connection pool using `mysql2/promise`. The pool is exported as default and reused across the entire app. |

Both files read credentials from environment variables defined in `.env`.
