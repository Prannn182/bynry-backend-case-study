const express = require('express');
const router = express.Router();

// GET /api/companies/:company_id/alerts/low-stock
router.get('/api/companies/:company_id/alerts/low-stock', async (req, res) => {
  const { company_id } = req.params;
  const alerts = [];

  try {
    // 1. Fetch inventory across all warehouses for the company
    const inventories = await db.query(`
      SELECT i.id AS inventory_id,
             i.quantity,
             p.id AS product_id,
             p.name AS product_name,
             p.sku,
             p.product_type,
             w.id AS warehouse_id,
             w.name AS warehouse_name
      FROM inventory i
      JOIN products p ON p.id = i.product_id
      JOIN warehouses w ON w.id = i.warehouse_id
      WHERE w.company_id = $1
    `, [company_id]);

    for (const row of inventories.rows) {

      // 2. Check recent sales activity (last 30 days)
      const recentSales = await db.query(`
        SELECT COUNT(*) 
        FROM inventory_movements
        WHERE inventory_id = $1
          AND change_quantity < 0
          AND created_at >= NOW() - INTERVAL '30 days'
      `, [row.inventory_id]);

      if (Number(recentSales.rows[0].count) === 0) continue;

      // 3. Determine low-stock threshold
      const threshold = getLowStockThreshold(row.product_type);

      if (row.quantity >= threshold) continue;

      // 4. Calculate average daily sales
      const avgDailySales = await getAverageDailySales(row.inventory_id);
      if (avgDailySales === 0) continue;

      const daysUntilStockout = Math.floor(
        row.quantity / avgDailySales
      );

      // 5. Fetch supplier details
      const supplier = await db.query(`
        SELECT s.id, s.name, s.contact_email
        FROM suppliers s
        JOIN product_suppliers ps ON ps.supplier_id = s.id
        WHERE ps.product_id = $1
        LIMIT 1
      `, [row.product_id]);

      alerts.push({
        product_id: row.product_id,
        product_name: row.product_name,
        sku: row.sku,
        warehouse_id: row.warehouse_id,
        warehouse_name: row.warehouse_name,
        current_stock: row.quantity,
        threshold,
        days_until_stockout: daysUntilStockout,
        supplier: supplier.rows.length ? supplier.rows[0] : null
      });
    }

    return res.json({
      alerts,
      total_alerts: alerts.length
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Helper Functions:

function getLowStockThreshold(productType) {
  const thresholds = {
    consumable: 20,
    electronic: 10,
    bundle: 5
  };
  return thresholds[productType] || 10;
}

2.
async function getAverageDailySales(inventoryId) {
  const result = await db.query(`
    SELECT ABS(SUM(change_quantity)) AS total_sold
    FROM inventory_movements
    WHERE inventory_id = $1
      AND change_quantity < 0
      AND created_at >= NOW() - INTERVAL '30 days'
  `, [inventoryId]);

  const totalSold = result.rows[0].total_sold || 0;
  return totalSold / 30;
}

