import * as productRepo from "../repositories/productRepository.js"
import { createAuditLog } from "../repositories/auditRepository.js"

export async function getAllProducts() {
  return productRepo.findAll()
}

export async function getProductBySku(sku) {
  const product = await productRepo.findBySku(sku)
  if (!product) {
    const err = new Error(`Product with SKU '${sku}' not found`)
    err.statusCode = 404
    throw err
  }
  return product
}

export async function createProduct(data) {
  const existing = await productRepo.findBySku(data.sku)
  if (existing) {
    const err = new Error(`Product with SKU '${data.sku}' already exists`)
    err.statusCode = 409
    throw err
  }
  return productRepo.create(data)
}

export async function updateProduct(sku, data) {
  const existing = await productRepo.findBySku(sku)
  if (!existing) {
    const err = new Error(`Product with SKU '${sku}' not found`)
    err.statusCode = 404
    throw err
  }
  return productRepo.update(sku, data)
}

export async function deleteProduct(sku) {
  const product = await productRepo.remove(sku)
  if (!product) {
    const err = new Error(`Product with SKU '${sku}' not found`)
    err.statusCode = 404
    throw err
  }

  // Save audit log in MongoDB
  await createAuditLog({
    entity: "product",
    entityId: sku,
    payload: product
  })

  return product
}
