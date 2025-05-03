const { pool } = require("../../config/db");
const { formatDistanceToNow } = require("date-fns");

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
            `SELECT 
                o.id AS order_id,
                o.order_total,
                o.createdAt,
                GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS categories
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN items i ON oi.item_id = i.id
             JOIN category c ON i.category_id = c.id
             GROUP BY o.id
             ORDER BY o.createdAt DESC
             LIMIT 5`
        );

        const formattedOrders = orders.map(order => ({
            order_id: order.order_id,
            amount: order.order_total,
            categories: order.categories,
            timestamp: formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })
        }));

        res.json({ success: true, recentOrders: formattedOrders });
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
