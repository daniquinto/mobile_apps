import { Router } from "express"
import { importData } from "../controllers/migrationController.js"

const router = Router()

router.post("/import", importData)

export default router
