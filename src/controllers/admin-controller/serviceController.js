const { pool } = require("../../config/db");

// Get total revenue by service type
const getRevenueByServiceType = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(`
      SELECT 
        s.name AS service_name,
        SUM(oi.quantity * i.price) AS total_revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN items i ON oi.item_id = i.id
      JOIN category c ON i.category_id = c.id
      JOIN services s ON c.service_id = s.id
      WHERE o.payment_status = 'PAID'
      GROUP BY s.name
    `);

    connection.release();

    const totalRevenue = rows.reduce((sum, row) => sum + (parseFloat(row.total_revenue) || 0), 0);

    const response = rows.map(row => {
      const revenue = parseFloat(row.total_revenue) || 0;
      return {
        name: row.service_name,
        amount: parseFloat(revenue.toFixed(2)),
        percentage: parseFloat(((revenue / totalRevenue) * 100).toFixed(1))
      };
    });

    res.json({ success: true, data: response });

  } catch (err) {
    console.error("Error fetching revenue by service:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
};




// Get all services
const getAllServices = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [services] = await connection.query("SELECT id,name, description, iconUrlBig,iconUrlSmall FROM services");
        connection.release();

        res.json({ success: true, data: services });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Add new service
const addService = async (req, res) => {
    const { id, name,description, iconUrlBig, iconUrlSmall } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            "INSERT INTO services (id,name, description, iconUrlBig,iconUrlSmall) VALUES (?, ?, ?, ?, ?)",
            [id, name,description, iconUrlBig, iconUrlSmall]
        );
        connection.release();

        res.json({ success: true, message: "Service added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    getAllServices,
    addService,
    getRevenueByServiceType
};
