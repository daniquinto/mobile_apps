import { Router } from "express"
import * as ctrl from "../controllers/productController.js"

const router = Router()

router.get("/",        ctrl.getAll)
router.get("/:sku",    ctrl.getOne)
router.post("/",       ctrl.create)
router.put("/:sku",    ctrl.update)
router.delete("/:sku", ctrl.remove)

export default router
