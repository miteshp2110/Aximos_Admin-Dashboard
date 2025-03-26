// controllers/dashboardController.js
const { pool } = require("../../config/db");

const getStats = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [[orders], [activeOrders], [revenue]] = await Promise.all([
            connection.query("SELECT COUNT(*) AS totalOrders FROM orders"),
            connection.query("SELECT COUNT(*) AS activeOrders FROM orders WHERE order_status = 'active'"),
            connection.query("SELECT SUM(total_amount) AS revenue FROM orders WHERE order_status = 'completed'")
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
