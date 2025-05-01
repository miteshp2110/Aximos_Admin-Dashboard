const { pool } = require("../../config/db");

// Get all orders
const getAllOrders = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [orders] = await connection.query("SELECT * FROM orders");
        res.json({ success: true, data: orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { order_status } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query("UPDATE orders SET order_status = ? WHERE id = ?", [order_status, id]);
        res.json({ success: true, message: "Order status updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get today's pickups
const getTodaysPickups = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [orders] = await connection.query(
            "SELECT * FROM orders WHERE DATE(pickup_date) = CURDATE()"
        );
        res.json({ success: true, todaysPickups: orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get top 5 recent orders
const getRecentOrders = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [orders] = await connection.query(
            "SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5"
        );
        res.json({ success: true, recentOrders: orders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get total number of orders
const getTotalOrders = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query("SELECT COUNT(*) AS total FROM orders");
        res.json({ success: true, totalOrders: result[0].total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get total revenue from completed orders
const getTotalRevenue = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query(
            "SELECT IFNULL(SUM(order_total), 0) AS total_revenue FROM orders WHERE order_status = '4'"
        );
        res.json({ success: true, totalRevenue: result[0].total_revenue });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getAllOrders,
    updateOrderStatus,
    getTotalOrders,
    getTotalRevenue,
    getRecentOrders,
    getTodaysPickups
};
