# repositories

Repositories are the only layer that talks directly to the database.
Services call repositories; repositories never call services.

| File | Database | Responsibility |
|------|----------|----------------|
| `productRepository.js` | MySQL | CRUD SQL queries for the `products` table. |
| `auditRepository.js` | MongoDB | Inserts audit log documents into the `audit_logs` collection. |
