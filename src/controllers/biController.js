import * as biService from "../services/biService.js"

export async function supplierSummary(req, res, next) {
  try {
    const data = await biService.getSupplierSummary()
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function customerPurchases(req, res, next) {
  try {
    const data = await biService.getCustomerPurchases(req.params.id)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function topProductsByCategory(req, res, next) {
  try {
    const data = await biService.getTopProductsByCategory(req.params.id)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
