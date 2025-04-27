// controllers/userController.js
const { pool } = require("../../config/db");

// Get all users
const getAllUsers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [users] = await connection.query("SELECT * FROM users");
        res.json({ success: true, data: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Update user status
const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);
        res.json({ success: true, message: "User status updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

// Get total number of users
const getTotalUsers = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [result] = await connection.query("SELECT COUNT(*) AS total_users FROM users");
        res.json({ success: true, total_users: result[0].total_users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getAllUsers,
    updateUserStatus,
    getTotalUsers
};
