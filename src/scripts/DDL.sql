-- ============================================================
-- MegaStore Global - SQL Schema (3NF)
-- Database: db_megastore_exam
-- Engine: MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS db_megastore_exam
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_megastore_exam;

-- --------------------------------------------------------
-- TABLE: categories
-- Extracted from the flat Excel to eliminate repeated strings.
-- 1NF: atomic values. 2NF/3NF: no partial or transitive deps.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- --------------------------------------------------------
-- TABLE: suppliers
-- Independent master entity.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE
);

-- --------------------------------------------------------
-- TABLE: customers
-- email is the natural unique key from the source data.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  email   VARCHAR(255) NOT NULL UNIQUE,
  name    VARCHAR(255) NOT NULL,
  phone   VARCHAR(50),
  address TEXT
);

-- --------------------------------------------------------
-- TABLE: products
-- sku is the natural PK. Linked to category and supplier.
-- Removing category_name/supplier_name from this table
-- satisfies 2NF and 3NF (no transitive dependencies).
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  sku         VARCHAR(50)    PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  unit_price  DECIMAL(12,2)  NOT NULL,
  category_id INT            NOT NULL,
  supplier_id INT            NOT NULL,
  active      BOOLEAN        DEFAULT TRUE,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE RESTRICT,
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id)
    REFERENCES suppliers(id) ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- TABLE: orders
-- One order (transaction) per customer per date.
-- transaction_id comes from the original Excel column.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(100) NOT NULL UNIQUE,
  customer_id    INT          NOT NULL,
  order_date     DATETIME     NOT NULL,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id)
    REFERENCES customers(id) ON DELETE RESTRICT
);

-- --------------------------------------------------------
-- TABLE: order_items
-- Line items of each order.
-- Composite UNIQUE prevents duplicate product per order.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT         NOT NULL,
  product_sku VARCHAR(50) NOT NULL,
  quantity    INT         NOT NULL CHECK (quantity > 0),
  CONSTRAINT fk_items_order   FOREIGN KEY (order_id)    REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_sku) REFERENCES products(sku) ON DELETE RESTRICT,
  UNIQUE KEY uq_order_product (order_id, product_sku)
);

-- --------------------------------------------------------
-- INDEXES for performance
-- --------------------------------------------------------
CREATE INDEX idx_products_category  ON products    (category_id);
CREATE INDEX idx_products_supplier  ON products    (supplier_id);
CREATE INDEX idx_orders_customer    ON orders      (customer_id);
CREATE INDEX idx_orders_date        ON orders      (order_date);
CREATE INDEX idx_items_order        ON order_items (order_id);
CREATE INDEX idx_items_product      ON order_items (product_sku);

-- ============================================================
-- VIEWS (bonus)
-- ============================================================

CREATE OR REPLACE VIEW v_order_summary AS
  SELECT
    o.id             AS order_id,
    o.transaction_id,
    o.order_date,
    c.name           AS customer,
    c.email          AS customer_email,
    SUM(oi.quantity * p.unit_price) AS order_total
  FROM orders o
  JOIN customers c   ON c.id  = o.customer_id
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p    ON p.sku = oi.product_sku
  GROUP BY o.id, o.transaction_id, o.order_date, c.name, c.email;

CREATE OR REPLACE VIEW v_supplier_inventory AS
  SELECT
    s.name           AS supplier,
    COUNT(p.sku)     AS total_products,
    SUM(p.unit_price) AS total_inventory_value
  FROM suppliers s
  JOIN products p ON p.supplier_id = s.id
  GROUP BY s.id, s.name;
