# controllers

Controllers receive HTTP requests, call the appropriate service, and return HTTP responses.
They do **not** contain business logic or database queries.

| File | Handles |
|------|---------|
| `productController.js` | Full CRUD for products (GET all, GET one, POST, PUT, DELETE). |
| `biController.js` | Business Intelligence queries: supplier summary, customer purchases, top products by category. |
| `migrationController.js` | Triggers the Excel import process via `POST /api/migration/import`. |
