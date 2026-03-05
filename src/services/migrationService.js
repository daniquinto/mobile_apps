import XLSX from "xlsx"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import pool from "../config/db/mysql.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const FILE_PATH = join(__dirname, "../data/raw_data.xlsx")

function loadRows() {
  const workbook = XLSX.readFile(FILE_PATH)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet)
}

function extractEntities(rows) {
  const customers = new Map()
  const suppliers  = new Map()
  const categories = new Map()
  const products   = new Map()

  for (const row of rows) {
    if (row.customer_email && !customers.has(row.customer_email)) {
      customers.set(row.customer_email, {
        email:   String(row.customer_email).trim(),
        name:    String(row.customer_name  || "").trim(),
        phone:   String(row.customer_phone || "").trim(),
        address: String(row.customer_address || "").trim()
      })
    }
    if (row.supplier_email && !suppliers.has(row.supplier_email)) {
      suppliers.set(row.supplier_email, {
        name:  String(row.supplier_name  || "").trim(),
        email: String(row.supplier_email || "").trim()
      })
    }
    if (row.product_category && !categories.has(row.product_category)) {
      categories.set(row.product_category, { name: String(row.product_category).trim() })
    }
    if (row.product_sku && !products.has(row.product_sku)) {
      products.set(row.product_sku, {
        sku:        String(row.product_sku  || "").trim(),
        name:       String(row.product_name || "").trim(),
        unit_price: parseFloat(row.unit_price) || 0,
        category:   String(row.product_category || "").trim(),
        supplier:   String(row.supplier_email   || "").trim()
      })
    }
  }

  return { customers, suppliers, categories, products, rows }
}

async function upsertCustomers(customers) {
  for (const c of customers.values()) {
    await pool.query(
      `INSERT INTO customers (email, name, phone, address)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), address = VALUES(address)`,
      [c.email, c.name, c.phone, c.address]
    )
  }
}

async function upsertSuppliers(suppliers) {
  for (const s of suppliers.values()) {
    await pool.query(
      `INSERT INTO suppliers (name, email)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [s.name, s.email]
    )
  }
}

async function upsertCategories(categories) {
  for (const c of categories.values()) {
    await pool.query(
      `INSERT INTO categories (name) VALUES (?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [c.name]
    )
  }
}

async function upsertProducts(products) {
  for (const p of products.values()) {
    const [[cat]]  = await pool.query(`SELECT id FROM categories WHERE name = ?`, [p.category])
    const [[supp]] = await pool.query(`SELECT id FROM suppliers WHERE email = ?`,  [p.supplier])
    if (!cat || !supp) continue
    await pool.query(
      `INSERT INTO products (sku, name, unit_price, category_id, supplier_id)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), unit_price = VALUES(unit_price)`,
      [p.sku, p.name, p.unit_price, cat.id, supp.id]
    )
  }
}

async function upsertOrdersAndItems(rows) {
  for (const row of rows) {
    if (!row.transaction_id || !row.customer_email) continue

    const [[cust]] = await pool.query(
      `SELECT id FROM customers WHERE email = ?`, [String(row.customer_email).trim()]
    )
    if (!cust) continue

    // Parse the date safely
    let orderDate = null
    if (row.date) {
      const d = new Date(row.date)
      orderDate = isNaN(d) ? null : d.toISOString().slice(0, 19).replace("T", " ")
    }

    await pool.query(
      `INSERT INTO orders (transaction_id, customer_id, order_date)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE customer_id = VALUES(customer_id)`,
      [String(row.transaction_id).trim(), cust.id, orderDate]
    )

    const [[order]] = await pool.query(
      `SELECT id FROM orders WHERE transaction_id = ?`, [String(row.transaction_id).trim()]
    )
    if (!order || !row.product_sku) continue

    await pool.query(
      `INSERT INTO order_items (order_id, product_sku, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
      [order.id, String(row.product_sku).trim(), parseInt(row.quantity) || 1]
    )
  }
}

export async function runMigration() {
  const rows = loadRows()
  const { customers, suppliers, categories, products } = extractEntities(rows)

  await upsertCustomers(customers)
  await upsertSuppliers(suppliers)
  await upsertCategories(categories)
  await upsertProducts(products)
  await upsertOrdersAndItems(rows)

  return {
    rows_processed: rows.length,
    customers: customers.size,
    suppliers: suppliers.size,
    categories: categories.size,
    products: products.size
  }
}
