// controllers/dashboardController.js
const { pool } = require("../../config/db");

const getStats = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [[orders], [activeOrders], [revenue]] = await Promise.all([
            connection.query("SELECT COUNT(*) AS totalOrders FROM orders"),
            connection.query(`
                SELECT COUNT(*) AS activeOrders 
                FROM orders o
                JOIN order_status_names s ON o.order_status = s.id
                WHERE s.statusName = 'active'
            `),
            connection.query(`
                SELECT SUM(order_total) AS revenue 
                FROM orders o
                JOIN order_status_names s ON o.order_status = s.id
                WHERE s.statusName = 'completed'
            `)
        ]);

        connection.release();

        res.json({
            totalOrders: orders[0].totalOrders,
            activeOrders: activeOrders[0].activeOrders,
            revenue: revenue[0].revenue || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getStats
};
