import pool from "../config/db/mysql.js"

export async function findAll() {
  const [rows] = await pool.query(`
    SELECT p.sku, p.name, p.unit_price, p.active,
           c.name AS category, s.name AS supplier
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN suppliers s ON p.supplier_id = s.id
  `)
  return rows
}

export async function findBySku(sku) {
  const [rows] = await pool.query(`
    SELECT p.sku, p.name, p.unit_price, p.active,
           c.name AS category, s.name AS supplier
    FROM products p
    JOIN categories c ON p.category_id = c.id
    JOIN suppliers s ON p.supplier_id = s.id
    WHERE p.sku = ?
  `, [sku])
  return rows[0] || null
}

export async function create({ sku, name, unit_price, category_id, supplier_id }) {
  await pool.query(
    `INSERT INTO products (sku, name, unit_price, category_id, supplier_id) VALUES (?, ?, ?, ?, ?)`,
    [sku, name, unit_price, category_id, supplier_id]
  )
  return findBySku(sku)
}

export async function update(sku, { name, unit_price, category_id, supplier_id }) {
  await pool.query(
    `UPDATE products SET name = ?, unit_price = ?, category_id = ?, supplier_id = ? WHERE sku = ?`,
    [name, unit_price, category_id, supplier_id, sku]
  )
  return findBySku(sku)
}

export async function remove(sku) {
  const product = await findBySku(sku)
  if (!product) return null
  await pool.query(`DELETE FROM products WHERE sku = ?`, [sku])
  return product
}
