const db = require('../database/pool');

const getSalesReport = async (req, res) => {
  try {
    const { developer_id, compound_id, start_date, end_date } = req.query;

    let query = `
      SELECT 
        d.name AS developer_name,
        c.name AS compound_name,
        COUNT(u.id) AS total_units,
        COUNT(u.id) FILTER (WHERE u.status = 'sold') AS sold_units,
        COUNT(u.id) FILTER (WHERE u.status = 'available') AS available_units,
        COUNT(u.id) FILTER (WHERE u.status = 'rented') AS rented_units,
        COUNT(u.id) FILTER (WHERE u.status = 'reserved') AS reserved_units,
        COUNT(u.id) FILTER (WHERE u.status = 'rented') AS rented_units,
        COALESCE(SUM(u.price) FILTER (WHERE u.status = 'sold'), 0) AS total_sales,
        COALESCE(AVG(u.price), 0) AS avg_price
      FROM units u
      LEFT JOIN developers d ON u.developer_id = d.id
      LEFT JOIN compounds c ON u.compound_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 0;

    if (developer_id) {
      params.push(developer_id);
      query += ` AND u.developer_id = $${++paramIndex}`;
    }

    if (compound_id) {
      params.push(compound_id);
      query += ` AND u.compound_id = $${++paramIndex}`;
    }

    if (start_date) {
      params.push(start_date);
      query += ` AND u.created_at >= $${++paramIndex}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND u.created_at <= $${++paramIndex}`;
    }

    query += ` GROUP BY d.name, c.name ORDER BY total_sales DESC`;

    const result = await db.query(query, params);
    res.json({ report: result.rows });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
};

const getStatistics = async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) AS total_units,
        COUNT(*) FILTER (WHERE status = 'available') AS available_units,
        COUNT(*) FILTER (WHERE status = 'sold') AS sold_units,
        COUNT(*) FILTER (WHERE status = 'reserved') AS reserved_units,
        COUNT(*) FILTER (WHERE status = 'rented') AS rented_units,
        COALESCE(AVG(price), 0) AS avg_price,
        COALESCE(MIN(price), 0) AS min_price,
        COALESCE(MAX(price), 0) AS max_price,
        COALESCE(SUM(price) FILTER (WHERE status = 'sold'), 0) AS total_sales_value
      FROM units
    `);

    const byDeveloper = await db.query(`
      SELECT 
        d.name,
        COUNT(u.id) AS total_units,
        COUNT(u.id) FILTER (WHERE u.status = 'sold') AS sold_units,
        COALESCE(SUM(u.price) FILTER (WHERE u.status = 'sold'), 0) AS sales_value
      FROM developers d
      LEFT JOIN units u ON d.id = u.developer_id
      GROUP BY d.name
      ORDER BY total_units DESC
    `);

    const byCompound = await db.query(`
      SELECT 
        c.name,
        COUNT(u.id) AS total_units,
        COUNT(u.id) FILTER (WHERE u.status = 'sold') AS sold_units,
        COALESCE(SUM(u.price) FILTER (WHERE u.status = 'sold'), 0) AS sales_value
      FROM compounds c
      LEFT JOIN units u ON c.id = u.compound_id
      GROUP BY c.name
      ORDER BY total_units DESC
    `);

    const byStatus = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM units
      GROUP BY status
      ORDER BY count DESC
    `);

    res.json({
      overview: stats.rows[0],
      byDeveloper: byDeveloper.rows,
      byCompound: byCompound.rows,
      byStatus: byStatus.rows
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

const getPriceTrends = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    
    const result = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) AS month,
        COUNT(*) AS units_added,
        COUNT(*) FILTER (WHERE status = 'sold') AS units_sold,
        COALESCE(AVG(price), 0) AS avg_price,
        COALESCE(SUM(price) FILTER (WHERE status = 'sold'), 0) AS sales_value
      FROM units
      WHERE created_at >= NOW() - INTERVAL '${parseInt(months)} months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month ASC
    `);

    res.json({ trends: result.rows });
  } catch (error) {
    console.error('Error fetching price trends:', error);
    res.status(500).json({ error: 'Failed to fetch price trends' });
  }
};

const getDeveloperPerformance = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        d.name AS developer_name,
        COUNT(u.id) AS total_units,
        COUNT(u.id) FILTER (WHERE u.status = 'sold') AS sold_units,
        COUNT(u.id) FILTER (WHERE u.status = 'available') AS available_units,
        COUNT(u.id) FILTER (WHERE u.status = 'rented') AS rented_units,
        COALESCE(SUM(u.price) FILTER (WHERE u.status = 'sold'), 0) AS total_sales,
        COALESCE(AVG(u.price), 0) AS avg_price,
        ROUND(
          (COUNT(u.id) FILTER (WHERE u.status = 'sold')::numeric / NULLIF(COUNT(u.id), 0) * 100),
          2
        ) AS sell_through_rate
      FROM developers d
      LEFT JOIN units u ON d.id = u.developer_id
      GROUP BY d.name
      ORDER BY total_sales DESC
    `);

    res.json({ performance: result.rows });
  } catch (error) {
    console.error('Error fetching developer performance:', error);
    res.status(500).json({ error: 'Failed to fetch developer performance' });
  }
};

module.exports = {
  getSalesReport,
  getStatistics,
  getPriceTrends,
  getDeveloperPerformance
};
