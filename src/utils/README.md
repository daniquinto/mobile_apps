# utils

Shared utility functions used across the application.

| File | Purpose |
|------|---------|
| `logger.js` | Exports `logEvent(payload)` – inserts a document into the MongoDB `audit_logs` collection. Used by the migration and the product delete flow. |
