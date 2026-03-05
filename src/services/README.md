# services

Services contain the business logic. They call repositories or run queries and apply rules
(e.g. checking if a product exists before deleting it, writing to the audit log).

| File | Responsibility |
|------|----------------|
| `productService.js` | CRUD logic for products. Calls `productRepository` for SQL and `auditRepository` for MongoDB on delete. |
| `biService.js` | SQL aggregation queries that answer the three BI questions. |
| `migrationService.js` | Reads the Excel file, extracts unique entities, and runs idempotent UPSERT statements into MySQL. |
