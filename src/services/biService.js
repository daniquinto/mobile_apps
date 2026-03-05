import pool from "../config/db/mysql.js"

/**
 * BI Query 1: Supplier Analysis
 * Which suppliers sold the most items and the total inventory value associated with them.
 */
export async function getSupplierSummary() {
  const [rows] = await pool.query(`
    SELECT
      s.id,
      s.name AS supplier,
      s.email,
      COUNT(DISTINCT p.sku)                         AS total_products,
      COALESCE(SUM(oi.quantity), 0)                 AS total_items_sold,
      SUM(p.unit_price * COALESCE(oi.quantity, 0))  AS inventory_value
    FROM suppliers s
    JOIN products p ON p.supplier_id = s.id
    LEFT JOIN order_items oi ON oi.product_sku = p.sku
    GROUP BY s.id, s.name, s.email
    ORDER BY total_items_sold DESC
  `)
  return rows
}

/**
 * BI Query 2: Customer Purchase History
 * All orders for a specific customer with product details and totals.
 */
export async function getCustomerPurchases(customerId) {
  const [rows] = await pool.query(`
    SELECT
      o.id           AS order_id,
      o.transaction_id,
      o.order_date,
      p.name         AS product,
      p.sku,
      oi.quantity,
      p.unit_price,
      (oi.quantity * p.unit_price) AS line_total
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.sku = oi.product_sku
    WHERE o.customer_id = ?
    ORDER BY o.order_date DESC
  `, [customerId])
  return rows
}

/**
 * BI Query 3: Top Products by Category
 * Best-selling products inside a category, ordered by total revenue.
 */
export async function getTopProductsByCategory(categoryId) {
  const [rows] = await pool.query(`
    SELECT
      p.sku,
      p.name         AS product,
      p.unit_price,
      SUM(oi.quantity)                        AS units_sold,
      SUM(oi.quantity * p.unit_price)         AS total_revenue
    FROM products p
    JOIN order_items oi ON oi.product_sku = p.sku
    WHERE p.category_id = ?
    GROUP BY p.sku, p.name, p.unit_price
    ORDER BY total_revenue DESC
  `, [categoryId])
  return rows
}
