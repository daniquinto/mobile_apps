import { Router } from "express"
import productRoutes   from "./productRoutes.js"
import biRoutes        from "./biRoutes.js"
import migrationRoutes from "./migrationRoutes.js"

const router = Router()

// Health check + route map — GET /api
router.get("/", (req, res) => {
  res.json({
    status: "ok",
    base: "/api",
    endpoints: {
      products: {
        "GET /api/products":          "List all products",
        "GET /api/products/:sku":     "Get one product by SKU",
        "POST /api/products":         "Create a product",
        "PUT /api/products/:sku":     "Update a product",
        "DELETE /api/products/:sku":  "Delete product + audit log"
      },
      businessIntelligence: {
        "GET /api/bi/suppliers/summary":             "Supplier ranking by items sold",
        "GET /api/bi/customers/:id/purchases":       "Purchase history for a customer",
        "GET /api/bi/categories/:id/top-products":   "Top products in a category by revenue"
      },
      migration: {
        "POST /api/migration/import": "Import Excel data (idempotent)"
      }
    }
  })
})

router.use("/products",  productRoutes)
router.use("/bi",        biRoutes)
router.use("/migration", migrationRoutes)

export default router
