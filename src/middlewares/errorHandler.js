export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.url} ->`, err.message)
  const status = err.statusCode || 500
  res.status(status).json({ success: false, message: err.message || "Internal server error" })
}
