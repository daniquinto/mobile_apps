# MegaStore Global — Backend API

A Node.js + Express REST API that migrates MegaStore Global's legacy Excel data into
a normalized MySQL database and a MongoDB audit log, then exposes CRUD and Business
Intelligence endpoints.

---

## Architecture

```
src/
├── app.js                  ← Express entry point
├── config/db/              ← DB connection modules (MySQL pool + MongoDB client)
├── controllers/            ← HTTP request/response handlers
├── services/               ← Business logic
├── repositories/           ← Database queries (SQL + MongoDB)
├── routes/                 ← URL → controller mapping
├── middlewares/            ← errorHandler, notFound
├── migrations/             ← CLI migration runner
├── scripts/                ← DDL.sql, test scripts, MongoDB validator
├── utils/                  ← logger (MongoDB audit helper)
└── data/                   ← raw_data.xlsx (source file)
docs/
├── data-model.md           ← Normalization explanation
└── postman_collection.json ← Ready-to-import Postman file
```

---

## SQL Normalization (3NF)

The flat Excel file contained repeated data on every row (customer name on every
transaction, supplier name on every product line). We decomposed it:

- **1NF** — Each column holds one value; no comma-separated lists.
- **2NF** — Removed partial dependencies: `supplier_name` and `category_name`
  depended on `product_sku`, not on `transaction_id`, so they moved to their own tables.
- **3NF** — Removed transitive dependencies: `customer_address` depended on
  `customer_email`, not on `transaction_id`. The `customers` table owns the address.

**Resulting tables:** `customers`, `suppliers`, `categories`, `products`,
`orders`, `order_items`.

---

## MongoDB Design

MongoDB stores `audit_logs` — a record of every deleted SQL entity.

**Why embedded?** When a product is deleted from MySQL it no longer exists.
The MongoDB document stores the full JSON snapshot of what was deleted, so we
can audit it even after the SQL row is gone. Embedding is correct here because
audit reads always want the complete event in one query.

---

## Requirements

- Node.js 18+
- MySQL 8+
- MongoDB 6+ (Atlas or local)

---

## Install

```bash
npm install
```

---

## Configure

```bash
cp .env.example .env
# Edit .env with your database credentials
```

---

## Create SQL Schema

```bash
mysql -u root -p < src/scripts/DDL.sql
```

## Apply MongoDB Validation

```bash
node src/scripts/mongoValidation.js
```

---

## Run the Server

```bash
npm start
# or for development (auto-restart on save):
npm run dev
```

---

## Run Migration (CLI)

```bash
npm run migrate
```

The migration is **idempotent** — running it multiple times will not create
duplicate customers, products, or orders. It uses `ON DUPLICATE KEY UPDATE`.

---

## Run Migration (API)

```http
POST http://localhost:3000/api/migration/import
```

---

## API Endpoints

### Products (Full CRUD)

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/:sku` | Get one product by SKU |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:sku` | Update a product |
| DELETE | `/api/products/:sku` | Delete product + write audit log to MongoDB |

**POST / PUT body example:**
```json
{
  "sku": "TST-001",
  "name": "Test Product",
  "unit_price": 99000,
  "category_id": 1,
  "supplier_id": 1
}
```

### Business Intelligence

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/bi/suppliers/summary` | Suppliers ranked by items sold + inventory value |
| GET | `/api/bi/customers/:id/purchases` | Full purchase history of a customer |
| GET | `/api/bi/categories/:id/top-products` | Best-selling products in a category by revenue |

### Migration

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/migration/import` | Import Excel data into SQL (idempotent) |

---

## Example Requests (curl)

```bash
# Get all products
curl http://localhost:3000/api/products

# Get supplier BI summary
curl http://localhost:3000/api/bi/suppliers/summary

# Get purchase history for customer id 1
curl http://localhost:3000/api/bi/customers/1/purchases

# Get top products in category id 1
curl http://localhost:3000/api/bi/categories/1/top-products

# Run migration
curl -X POST http://localhost:3000/api/migration/import

# Delete a product (creates audit log in MongoDB)
curl -X DELETE http://localhost:3000/api/products/TST-001
```

---

## Ubuntu — Install DB Engines (bonus)

```bash
# MySQL 8
sudo apt update
sudo apt install mysql-server -y
sudo mysql_secure_installation

# MongoDB 6
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" \
  | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org -y
sudo systemctl start mongod
```
