Overview :
This API endpoint returns low-stock alerts for a company by analyzing inventory levels across all warehouses. Alerts are generated only for products with recent sales activity and include supplier details to help with reordering.
The implementation follows the provided business rules while documenting assumptions where requirements are incomplete.

Endpoint Specification
GET /api/companies/:company_id/alerts/low-stock

Assumptions
Because the requirements are intentionally incomplete, the following assumptions were made:
- Recent sales activity means at least one sale in the last 30 days


- Inventory changes are recorded in an inventory_movements table


- Low-stock thresholds are determined by product_type


- Average daily sales are calculated using the last 30 days of data


- Each product has a primary supplier


- Alerts are generated per product per warehouse


- These assumptions are explicitly documented and can be adjusted based on product requirements.
  
High-Level Approach

- Fetch all inventory records for the company across warehouses


- Filter products with recent sales activity


- Determine low-stock threshold based on product type


- Compare current stock with the threshold


- Estimate days until stockout


- Attach supplier details


- Return alerts in the required response format

Edge Cases Considered

-Products with no recent sales are excluded


- Division-by-zero avoided


- Supports multiple warehouses per company


- Missing supplier data handled safely


- Products above threshold are ignored


- Database errors handled gracefully



Design Decisions Explained

- Warehouse-level alerts improve restocking accuracy


- Sales-based filtering reduces alert noise


- Product-type thresholds support flexible business rules


- Supplier inclusion makes alerts immediately actionable


- Explicit assumptions improve clarity and maintainability
