# migrations

Contains the data migration scripts that import the raw Excel file into the SQL database.

| File | Purpose |
|------|---------|
| `migrateExcel.js` | Standalone CLI script. Run with `npm run migrate`. Connects to both databases, runs the migration, logs progress. |

The actual migration logic lives in `src/services/migrationService.js`.
The migration is **idempotent**: running it multiple times produces the same result
because all INSERT statements use `ON DUPLICATE KEY UPDATE`.
