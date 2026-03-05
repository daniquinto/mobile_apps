# routes

Express Router definitions. Each file maps URL paths to controller functions.

| File | Base path | Description |
|------|-----------|-------------|
| `index.js` | `/api` | Aggregates all sub-routers. |
| `productRoutes.js` | `/api/products` | CRUD endpoints for products. |
| `biRoutes.js` | `/api/bi` | Business Intelligence query endpoints. |
| `migrationRoutes.js` | `/api/migration` | Data migration trigger. |
