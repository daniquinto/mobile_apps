import * as productService from "../services/productService.js"

export async function getAll(req, res, next) {
  try {
    const products = await productService.getAllProducts()
    res.json({ success: true, data: products })
  } catch (err) { next(err) }
}

export async function getOne(req, res, next) {
  try {
    const product = await productService.getProductBySku(req.params.sku)
    res.json({ success: true, data: product })
  } catch (err) { next(err) }
}

export async function create(req, res, next) {
  try {
    const product = await productService.createProduct(req.body)
    res.status(201).json({ success: true, data: product })
  } catch (err) { next(err) }
}

export async function update(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.sku, req.body)
    res.json({ success: true, data: product })
  } catch (err) { next(err) }
}

export async function remove(req, res, next) {
  try {
    const product = await productService.deleteProduct(req.params.sku)
    res.json({ success: true, message: "Product deleted", data: product })
  } catch (err) { next(err) }
}
