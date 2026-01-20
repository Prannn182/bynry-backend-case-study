Overview: 
The goal of the database design is to support a multi-company, multi-warehouse inventory management system. The schema must be flexible enough to handle inventory tracking, supplier relationships, and product bundles, while maintaining data consistency and scalability.
Since the requirements are intentionally incomplete, this design makes reasonable assumptions and highlights areas that require further clarification from the product team.
1. Schema Design
1.1 Companies:
companies
id                  UUID PRIMARY KEY
name                VARCHAR(255)
created_at         TIMESTAMP
Represents a customer using the platform.

1.2 Warehouses
warehouses
id                     UUID PRIMARY KEY
company_id             UUID REFERENCES companies(id)
name                   VARCHAR(255)
location              VARCHAR(255)
created_at           TIMESTAMP
1.3 Products
products
id                      UUID PRIMARY KEY
company_id               UUID REFERENCES companies(id)
name                     VARCHAR(255)
sku                    VARCHAR(100) UNIQUE
price                  DECIMAL(10,2)
product_type          VARCHAR(50)
created_at           TIMESTAMP
1.4 Inventory
inventory
id                    UUID PRIMARY KEY
product_id            UUID REFERENCES products(id)
warehouse_id          UUID REFERENCES warehouses(id)
quantity              INTEGER
updated_at         TIMESTAMP
UNIQUE (product_id, warehouse_id)
Tracks how much of a product exists in each warehouse.

1.5 Inventory Movements
Inventory_movements

id                          UUID PRIMARY KEY
inventory_id         UUID REFERENCES inventory(id)
Change_quantity  INTEGER
reason                  VARCHAR(100)
created_at           TIMESTAMP
Keeps an audit trail of inventory changes (sales, restocks, adjustments).

1.6 Suppliers
suppliers

id                   UUID PRIMARY KEY
name              VARCHAR(255)
contact_email   VARCHAR(255)
created_at      TIMESTAMP

1.7 Product–Supplier Mapping
Product_suppliers

product_id      UUID REFERENCES products(id)
supplier_id     UUID REFERENCES suppliers(id)
PRIMARY KEY (product_id, supplier_id)
Supports multiple suppliers per product.

1.8 Product Bundles
product_bundles
bundle_product_id   UUID REFERENCES products(id)
child_product_id    UUID REFERENCES products(id)
quantity            INTEGER
PRIMARY KEY (bundle_product_id, child_product_id)
Represents bundled products composed of other products.

# SQL DDL Scripts
-- 1.1 Companies
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Warehouses
CREATE TABLE warehouses (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    name VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 Products
CREATE TABLE products (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    name VARCHAR(255),
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2),
    product_type VARCHAR(50), -- e.g., 'simple', 'bundle'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.6 Suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 Inventory
CREATE TABLE inventory (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    quantity INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, warehouse_id)
);

-- 1.5 Inventory Movements
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY,
    inventory_id UUID NOT NULL REFERENCES inventory(id),
    change_quantity INTEGER NOT NULL,
    reason VARCHAR(100), -- e.g., 'sale', 'restock', 'correction'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.7 Product-Supplier Mapping
CREATE TABLE product_suppliers (
    product_id UUID REFERENCES products(id),
    supplier_id UUID REFERENCES suppliers(id),
    PRIMARY KEY (product_id, supplier_id)
);

-- 1.8 Product Bundles
CREATE TABLE product_bundles (
    bundle_product_id UUID REFERENCES products(id),
    child_product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL, -- Qty of child needed for the bundle
    PRIMARY KEY (bundle_product_id, child_product_id)
);

2. Missing Requirements & Questions for Product Team
- To finalize the design, the following questions should be clarified:
- Can a product belong to multiple suppliers, or is there a primary supplier?


- How should inventory be handled when a bundle is sold?


- Should inventory movements be created automatically for all stock changes?


- What defines “recent sales activity” for reporting and alerts?


- Are low-stock thresholds configurable per warehouse or globally?


- Should deleted products retain inventory history?


- Can warehouses transfer inventory between each other?
3. Design Decisions & Justifications:
  
- Separation of Product and Inventory

- Allows products to exist in multiple warehouses


- Prevents duplication of product data


Composite Unique Constraints:
- Prevents duplicate inventory rows per product and warehouse


- Ensures data consistency


Inventory Movements Table:
- Enables auditing and historical analysis


- Supports analytics and alerting features


Bundle Table Design: 
- Allows flexible product composition


- Supports future expansion (nested bundles)




Indexing Strategy:

- Index on sku for fast product lookup


- Composite index on (product_id, warehouse_id) for inventory queries


- Index on inventory_id in inventory_movements for reporting

  <img width="2076" height="1155" alt="erd (2)" src="https://github.com/user-attachments/assets/99390433-e3bf-4a59-9dd2-9c41429c7a1b" />




