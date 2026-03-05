# Data Model Documentation

## SQL Schema (MySQL) — 3rd Normal Form

### Normalization Decisions

**1NF:** Every column holds a single atomic value. The original Excel row was a "fat" row mixing customer info, product info, supplier info and order info. We split those into separate tables.

**2NF:** Every non-key attribute depends on the *whole* primary key (no partial dependencies). In `order_items` the only non-key columns are `quantity`; `product_sku` and `order_id` together form the unique key.

**3NF:** No transitive dependencies. Example: in the original Excel, `supplier_name` depended on `product_sku`, not on `customer_email`. We separated suppliers into their own table to remove that transitive path.

### Entity-Relationship (text description)

```
customers ──< orders ──< order_items >── products >── categories
                                                  │
                                              suppliers
```

| Table | PK | Notable constraints |
|-------|----|---------------------|
| `customers` | `id` | `email` UNIQUE NOT NULL |
| `suppliers` | `id` | `name` UNIQUE, `email` UNIQUE |
| `categories` | `id` | `name` UNIQUE NOT NULL |
| `products` | `sku` | FK → categories, FK → suppliers |
| `orders` | `id` | `transaction_id` UNIQUE, FK → customers |
| `order_items` | `id` | UNIQUE(order_id, product_sku), FK → orders, FK → products |

---

## MongoDB Collection — audit_logs

### Why MongoDB for Audit Logs?

Audit logs are write-heavy, schema-flexible documents. Each deleted entity may have a different shape. MongoDB's document model is a natural fit: we store the full JSON snapshot without needing to define every column up front.

### Document Structure

```json
{
  "_id": ObjectId("..."),
  "entity": "product",
  "entityId": "LPT-HP-001",
  "deletedAt": ISODate("2024-06-01T10:00:00Z"),
  "payload": {
    "sku": "LPT-HP-001",
    "name": "Laptop HP Pavilion 15",
    "unit_price": 3500000,
    "category": "Electronics",
    "supplier": "TechDistro SAS"
  },
  "createdAt": ISODate("2024-06-01T10:00:00Z")
}
```

### Embedding vs. Referencing

The `payload` field is **embedded** (not referenced) because:
- We want to preserve the exact state of the record **at the time of deletion**.
- The referenced SQL record no longer exists after deletion.
- Audit reads are infrequent and read the full document at once.

### Schema Validation

Applied via `src/scripts/mongoValidation.js`. Required fields: `entity`, `entityId`, `deletedAt`, `payload`.
