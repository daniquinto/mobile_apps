import { Router } from "express"
import * as ctrl from "../controllers/biController.js"

const router = Router()

router.get("/suppliers/summary",          ctrl.supplierSummary)
router.get("/customers/:id/purchases",    ctrl.customerPurchases)
router.get("/categories/:id/top-products",ctrl.topProductsByCategory)

export default router
