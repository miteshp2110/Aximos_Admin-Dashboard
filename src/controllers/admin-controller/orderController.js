// controllers/orderController.js
const { pool } = require("../../config/db");

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [orders] = await connection.query("SELECT * FROM orders");
        connection.release();

        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { order_status } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query("UPDATE orders SET order_status = ? WHERE id = ?", [order_status, id]);
        connection.release();

        res.json({ message: "Order status updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get total number of orders
const getTotalOrders = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query("SELECT COUNT(*) AS total FROM orders");
        connection.release();

        res.json({ totalOrders: result[0].total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    getAllOrders,
    updateOrderStatus,
    getTotalOrders
};
