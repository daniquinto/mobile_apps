# middlewares

Express middleware functions that run on every request.

| File | Purpose |
|------|---------|
| `errorHandler.js` | Global error handler. Catches errors thrown by controllers and returns a consistent JSON error response with the correct HTTP status code. |
| `notFound.js` | 404 handler. Returns a JSON 404 response when no route matched the request. |

Both are registered in `app.js` **after** all routes, as Express requires.
